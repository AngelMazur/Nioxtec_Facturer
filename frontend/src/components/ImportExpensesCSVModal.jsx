import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiGet, apiPost, apiDelete } from '../lib/api'
import { useStore } from '../store/store'

// Utilities to parse and normalize CSV content according to user's rules
function parseDateDMY(input) {
  // Accept d/m/yy or dd/mm/yy (also with leading zeros)
  if (!input) return null
  const trimmed = String(input).trim()
  const m = trimmed.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{2})\s*$/)
  if (!m) return null
  let d = parseInt(m[1], 10)
  let mo = parseInt(m[2], 10)
  let yy = parseInt(m[3], 10)
  if (isNaN(d) || isNaN(mo) || isNaN(yy)) return null
  // Assume 2000-2099 for 2-digit years
  const year = 2000 + yy
  // Basic range checks
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  // Build ISO date (not validating month/day combos strictly)
  const iso = `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return iso
}

function parseEuroDecimal(str) {
  if (str == null) return { ok: false }
  // Accept forms like -382,92 or 0 or 123
  const s = String(str).trim().replace(/\s+/g, '')
  // If it contains both comma and dot, reject (no thousands allowed)
  if (s.includes(',') && s.includes('.')) return { ok: false }
  const normalized = s.replace(',', '.')
  const f = Number(normalized)
  if (!isFinite(f)) return { ok: false }
  return { ok: true, value: f }
}

function safeSplitCSVLine(line) {
  // Minimal CSV splitter supporting commas and simple quoted fields
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        cur += '"'; i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function parseBankCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return { rows: [], errors: ['CSV vacío'] }
  const header = safeSplitCSVLine(lines[0]).map(h => h.trim().toLowerCase())
  // expected headers (for documentation)
  // const expected = ['Fecha ctble','Fecha valor','Concepto','Importe','Moneda','Saldo','Moneda','Concepto ampliado']
  // Only check prefix of headers (to be tolerant with accents/case)
  const okHeader = (
    header.length >= 7 &&
    header[0].startsWith('fecha') && header[1].startsWith('fecha') && header[2].startsWith('concepto') &&
    header[3].startsWith('importe') && header[4].startsWith('moneda') && header[5].startsWith('saldo')
  )
  const errors = []
  if (!okHeader) errors.push('Encabezados inválidos o faltantes')

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = safeSplitCSVLine(lines[i])
    // Padding to at least 8 columns
    while (cols.length < 8) cols.push('')
    const [fCtb, fVal, concepto, importeStr, moneda1, saldoStr, moneda2, conceptoAmp] = cols
    const r = {
      raw: { fCtb, fVal, concepto, importeStr, moneda1, saldoStr, moneda2, conceptoAmp },
      accounting_date: parseDateDMY(fCtb),
      value_date: parseDateDMY(fVal),
      description: (concepto || '').trim().replace(/\s+/g, ' '),
      extended_description: (conceptoAmp || '').trim().replace(/\s+/g, ' '),
      amount_currency: (moneda1 || '').trim().toUpperCase(),
      balance_currency: (moneda2 || '').trim().toUpperCase(),
      errors: []
    }
    const imp = parseEuroDecimal(importeStr)
    if (!imp.ok) r.errors.push('Importe inválido')
    else {
      r.amount = imp.value
      r.amount_abs = Math.abs(imp.value)
    }
    const saldo = parseEuroDecimal(saldoStr)
    if (saldo.ok) r.balance = saldo.value
    if (!r.accounting_date) r.errors.push('Fecha ctble inválida')
    if (!r.value_date) r.errors.push('Fecha valor inválida')
    if (!(r.amount_currency === 'EUR' && r.balance_currency === 'EUR')) {
      r.errors.push('Moneda debe ser EUR')
    }
    // Only expenses (negative amounts)
    r.isExpense = imp.ok && imp.value < 0
    rows.push(r)
  }
  return { rows, errors }
}

function summarize(rows) {
  const expenseRows = rows.filter(r => r.isExpense)
  const first20 = expenseRows.slice(0, 20)
  const totalNeg = expenseRows.reduce((acc, r) => acc + (r.amount || 0), 0)
  const totalAbs = expenseRows.reduce((acc, r) => acc + (r.amount_abs || 0), 0)
  const dates = expenseRows.map(r => r.accounting_date).filter(Boolean).sort()
  const range = dates.length ? { min: dates[0], max: dates[dates.length - 1] } : { min: null, max: null }
  const errorsByRow = expenseRows.map((r, idx) => ({ idx, errors: r.errors }))
  return { preview: first20, count: expenseRows.length, sumNeg: totalNeg, sumAbs: totalAbs, range, errorsByRow }
}

function rowSignature(r) {
  // Duplicate if accounting_date + amount + description match
  return `${r.accounting_date}|${(r.amount ?? 0).toFixed(2)}|${r.description}`
}

export default function ImportExpensesCSVModal({ isOpen, onClose, onImported }) {
  const { token, addExpenseToEnd } = useStore()
  const [step, setStep] = React.useState('select') // select | preview | importing | done
  const [_, setRawText] = React.useState('')
  const [parsed, setParsed] = React.useState({ rows: [], errors: [] })
  const [summary, setSummary] = React.useState(null)
  const [existingIndex, setExistingIndex] = React.useState(new Map())
  const [omitDuplicates, setOmitDuplicates] = React.useState(true)
  const [defaultCategory, setDefaultCategory] = React.useState('Banco')
  const [defaultSupplier, setDefaultSupplier] = React.useState('Banco')
  const [defaultTax, setDefaultTax] = React.useState(0)

  React.useEffect(() => {
    if (!isOpen) {
      setStep('select'); setRawText(''); setParsed({ rows: [], errors: [] }); setSummary(null)
      setExistingIndex(new Map())
    }
  }, [isOpen])

  async function fetchAllExpensesIndex() {
    try {
      const resp = await apiGet(`/expenses?limit=10000&offset=0&sort=date&dir=desc`, token)
      const map = new Map()
      for (const e of resp.items || []) {
        // Build comparable signature using date + negative amount (CSV is negative)
        const amount = -Math.abs(Number(e.base_amount || 0)) // base used as absolute
        const sig = `${e.date}|${amount.toFixed(2)}|${(e.description || '').trim().replace(/\s+/g,' ')}`
        map.set(sig, e)
      }
      setExistingIndex(map)
    } catch {
      // Not critical, allow import without duplicate detection
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result?.toString() || ''
      setRawText(text)
      const p = parseBankCSV(text)
      setParsed(p)
      const sum = summarize(p.rows)
      setSummary(sum)
      setStep('preview')
      fetchAllExpensesIndex()
    }
    reader.onerror = () => toast.error('No se pudo leer el archivo')
    reader.readAsText(file, 'utf-8')
  }

  function getRowsToImport() {
    const expenses = parsed.rows.filter(r => r.isExpense && r.errors.length === 0)
    if (omitDuplicates && existingIndex.size) {
      return expenses.filter(r => !existingIndex.has(rowSignature(r)))
    }
    return expenses
  }

  async function importNow() {
    const rows = getRowsToImport()
    if (!rows.length) { toast('No hay filas válidas para importar'); return }
    setStep('importing')
    let imported = 0
    try {
      if (!omitDuplicates && existingIndex.size) {
        // Replace duplicates: delete existing before import
        for (const r of parsed.rows.filter(r => r.isExpense && r.errors.length === 0)) {
          const ex = existingIndex.get(rowSignature(r))
          if (ex?.id) {
            try { await apiDelete(`/expenses/${ex.id}`, token) } catch (e) { console.debug('delete dup failed', e) }
          }
        }
      }
      for (const r of rows) {
        const payload = {
          date: r.accounting_date,
          category: defaultCategory,
          description: r.extended_description ? `${r.description} — ${r.extended_description}` : r.description,
          supplier: defaultSupplier,
          base_amount: r.amount_abs, // CSV holds negative number; store absolute as base
          tax_rate: Number(defaultTax) || 0,
          // total derived in backend; can omit
          paid: false
        }
        const created = await apiPost('/expenses', payload, token)
        addExpenseToEnd(created)
        imported++
      }
      toast.success(`Importados ${imported} gastos`)
      setStep('done')
      onImported?.(imported)
    } catch (err) {
      toast.error('Error en importación: ' + (err?.message || ''))
      setStep('preview')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 240 }} className="bg-gray-900 text-gray-100 border border-gray-700 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Importar gastos desde CSV</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {step === 'select' && (
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-300">Sube un archivo .csv con los encabezados: Fecha ctble, Fecha valor, Concepto, Importe, Moneda, Saldo, Moneda, Concepto ampliado</p>
                <input type="file" accept=".csv" onChange={handleFile} className="block w-full text-sm" />
              </div>
            )}

            {step === 'preview' && summary && (
              <div className="p-5 space-y-4">
                {parsed.errors?.length > 0 && (
                  <div className="text-red-400 text-sm">{parsed.errors.join('; ')}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-800/60 rounded p-3">
                    <div className="text-sm">Nº de gastos: <span className="font-semibold">{summary.count}</span></div>
                    <div className="text-sm">Suma importes (negativa): <span className="font-semibold">{summary.sumNeg.toFixed(2)} EUR</span></div>
                    <div className="text-sm">Suma absoluta: <span className="font-semibold">{summary.sumAbs.toFixed(2)} EUR</span></div>
                    <div className="text-sm">Rango fechas: <span className="font-semibold">{summary.range.min || '-'} – {summary.range.max || '-'}</span></div>
                  </div>
                  <div className="bg-gray-800/60 rounded p-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={omitDuplicates} onChange={e => setOmitDuplicates(e.target.checked)} /> Omitir duplicados (por fecha+importe+concepto)</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <label className="flex flex-col gap-1"><span className="text-gray-400">Categoría por defecto</span><input value={defaultCategory} onChange={e=>setDefaultCategory(e.target.value)} className="px-2 py-1 rounded bg-gray-900 border border-gray-700" /></label>
                      <label className="flex flex-col gap-1"><span className="text-gray-400">Proveedor por defecto</span><input value={defaultSupplier} onChange={e=>setDefaultSupplier(e.target.value)} className="px-2 py-1 rounded bg-gray-900 border border-gray-700" /></label>
                      <label className="flex flex-col gap-1"><span className="text-gray-400">IVA por defecto (%)</span><input type="number" step="0.1" min="0" max="100" value={defaultTax} onChange={e=>setDefaultTax(e.target.value)} className="px-2 py-1 rounded bg-gray-900 border border-gray-700" /></label>
                    </div>
                    {existingIndex.size>0 && (
                      <div className="text-xs text-gray-400">Detección de duplicados cargada ({existingIndex.size} existentes indexados)</div>
                    )}
                  </div>
                </div>
                <div className="overflow-auto border border-gray-800 rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-800/60 text-gray-300">
                      <tr>
                        <th className="text-left px-2 py-1">Fecha</th>
                        <th className="text-left px-2 py-1">Concepto</th>
                        <th className="text-right px-2 py-1">Importe</th>
                        <th className="text-left px-2 py-1">Errores</th>
                        <th className="text-left px-2 py-1">Duplicado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.preview.map((r, idx) => {
                        const dup = existingIndex.size ? existingIndex.has(rowSignature(r)) : false
                        return (
                          <tr key={idx} className="odd:bg-gray-900/40">
                            <td className="px-2 py-1 whitespace-nowrap">{r.accounting_date || '-'}</td>
                            <td className="px-2 py-1">{r.description}</td>
                            <td className="px-2 py-1 text-right tabular-nums">{(r.amount||0).toFixed(2)}</td>
                            <td className="px-2 py-1 text-red-400">{r.errors.join('; ')}</td>
                            <td className="px-2 py-1">{dup ? 'Sí' : 'No'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 rounded px-4 py-2">Cancelar</button>
                  <button onClick={importNow} className="bg-primary hover:opacity-90 rounded px-4 py-2">Importar {getRowsToImport().length} gastos</button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="p-6 text-center text-gray-300">Importando…</div>
            )}

            {step === 'done' && (
              <div className="p-6 text-center space-y-4">
                <div className="text-green-400">Importación completada.</div>
                <button onClick={onClose} className="bg-primary rounded px-4 py-2">Cerrar</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
