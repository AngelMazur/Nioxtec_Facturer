import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiGet, apiPost, apiDelete } from '../lib/api'
import { useStore } from '../store/store'
import ExpenseAutocomplete from './ExpenseAutocomplete'

// Función de categorización inteligente basada en palabras clave
function categorizarPorConcepto(concepto) {
  if (!concepto) return 'Otros'
  const texto = concepto.toLowerCase()
  
  // MARKETING / PUBLICIDAD (antes de Alimentación para capturar "BOLD MARKETIN")
  if (/\b(publicidad|marketing|anuncio|campana|promocion|branding|marketin|bold.*marketin|facebook.*ads|instagram.*ads|google.*ads|google.*adwords|linkedin.*ads|twitter.*ads|tiktok.*ads|youtube.*ads|meta.*ads|adsense|sem|seo|posicionamiento|analytics|tag.*manager|hootsuite|buffer|mailchimp|sendinblue|mailerlite|newsletter|email.*marketing|social.*media|redes.*sociales|influencer|colaboracion|patrocinio|evento|feria|stand|cartel|banner|flyer|folleto|catalogo|tarjeta.*visita|diseno.*grafico|fotografia|video|audiovisual|produccion|edicion|agencia.*marketing|consultoria.*marketing|estrategia|marca|logo|identidad.*corporativa)\b/i.test(texto))
    return 'Marketing'
  
  // SERVICIOS / FISCAL (incluye autónomos, impuestos, TGSS)
  if (/\b(autonomos|autonomo|cotizacion|tgss|tesoreria.*general|seguridad.*social|hacienda|impuesto|irpf|iva|modelo.*[0-9]{3}|trimestre|declaracion|fiscal|tributacion|agencia.*tributaria|sat|aeat|seguro|poliza|axa|mapfre|mutua|sanitas|asisa|iberdrola|endesa|naturgy|fenosa|electricidad|luz|gas|butano|agua|aqualia|canal.*isabel|telefono|telefonia|movistar|vodafone|orange|yoigo|masmovil|fibra|internet|adsl|movil|celular|linea|tarifa|factura.*telefono|factura.*luz|factura.*agua|factura.*gas|suministro|servicio|limpieza|mantenimiento|reparacion|fontanero|electricista|carpintero|pintor|cerrajero|mudanza|trastero|alquiler.*local|alquiler.*oficina|arrendamiento|comunidad.*propietarios|ibi|basura|alcantarillado|asesor|asesoria|gestoria|abogado|notario|registro|legal|contable|laboral|recursos.*humanos|nomina|consultoria|auditoria|banco|comision|transferencia|cajero|tarjeta.*credito|prestamo|interes|hipoteca)\b/i.test(texto))
    return 'Servicios'
  
  // TECNOLOGÍA
  if (/\b(software|hardware|ordenador|pc|laptop|portatil|tablet|ipad|macbook|servidor|cloud|hosting|dominio|licencia|suscripcion|microsoft|office|windows|google|workspace|adobe|photoshop|illustrator|zoom|teams|slack|dropbox|github|bitbucket|aws|azure|digitalocean|vultr|heroku|netlify|vercel|cloudflare|ssl|certificado|api|desarrollo|programacion|codigo|web|app|movil|android|ios|apple|samsung|hp|dell|lenovo|asus|acer|impresora|escaner|router|switch|modem|wifi|ethernet|cable|usb|hdmi|monitor|pantalla|teclado|raton|mouse|auriculares|microfono|camara|webcam|disco.*duro|ssd|ram|memoria|gpu|procesador|cpu|mantenimiento.*informatico|reparacion.*ordenador|antivirus|backup|copia.*seguridad|bases.*datos|mysql|postgresql|mongodb|redis|servidor.*dedicado|vps|cdn)\b/i.test(texto))
    return 'Tecnología'
  
  // TRANSPORTE
  if (/\b(gasolina|combustible|diesel|gasoil|carburante|parking|aparcamiento|estacionamiento|peaje|autopista|taxi|uber|cabify|bolt|free.*now|tren|renfe|ave|cercanias|metro|autobus|bus|avion|vuelo|aeropuerto|billete|ticket|viaje|desplazamiento|kilometraje|alquiler.*coche|alquiler.*vehiculo|rent.*car|hertz|avis|europcar|enterprise|trafico|multa|itv|revision|taller|mecanico|neumaticos|ruedas|aceite|filtro|bateria|frenos|amortiguadores|transporte|envio|mensajeria|correos|seur|mrw|dhl|fedex|ups|glovo|deliveroo|just.*eat)\b/i.test(texto))
    return 'Transporte'
  
  // ALIMENTACIÓN (BOLD solo sin MARKETIN)
  if (/\b(restaurante|comida|almuerzo|cena|desayuno|menu|catering|bar|cafeteria|cafe|cerveza|vino|bebida|coca.*cola|pepsi|agua|snack|sandwich|bocadillo|pizza|hamburguesa|kebab|sushi|comida.*rapida|mcdonalds|burger.*king|kfc|subway|telepizza|dominos|supermercado|mercadona|carrefour|lidl|aldi|dia|alcampo|eroski|hipercor|consum|alimentacion|verduras|frutas|carne|pescado|pan|panaderia|pasteleria|dulces|chocolate)\b/i.test(texto) && !/marketin/i.test(texto))
    return 'Alimentación'
  
  // OFICINA / SUMINISTROS
  if (/\b(papeleria|oficina|material|fournier|staples|imprenta|impresion|fotocopias|encuadernacion|toner|cartucho|tinta|papel|folio|carpeta|archivador|boligrafo|lapiz|rotulador|marcador|post.*it|nota.*adhesiva|grapadora|perforadora|tijeras|cutter|cinta.*adhesiva|sobre|sello|stamp|etiqueta|cuaderno|libreta|agenda|calculadora|pizarra|proyector|presentacion|escritorio|mesa|silla|estanteria|armario|cajon|lampara|flexo|ventilador|calefactor|aire.*acondicionado|climatizacion)\b/i.test(texto))
    return 'Oficina'
  
  // FORMACIÓN
  if (/\b(curso|formacion|capacitacion|training|certificacion|certificado|master|postgrado|mba|doctorado|universidad|escuela|academia|instituto|udemy|coursera|platzi|linkedin.*learning|domestika|crehana|educacion|aprendizaje|clase|taller|seminario|webinar|conferencia|congreso|jornada|ponencia|charla|mentor|coaching|tutoria|libro|manual|guia|documentacion|suscripcion.*educativa)\b/i.test(texto))
    return 'Formación'
  
  // EQUIPAMIENTO
  if (/\b(mobiliario|mueble|equipamiento|herramienta|maquinaria|equipo|instrumental|material.*trabajo|uniforme|ropa.*trabajo|epi|proteccion|seguridad|casco|guantes|botas|chaleco|mascarilla|gafas.*proteccion)\b/i.test(texto))
    return 'Equipamiento'
  
  // VIAJES
  if (/\b(hotel|hostal|apartamento|alojamiento|booking|airbnb|reserva|habitacion|noche|estancia|pension.*completa|media.*pension|desayuno.*incluido|turismo|viaje.*negocios|dieta|per.*diem|congreso|feria.*comercial|visita.*cliente)\b/i.test(texto))
    return 'Viajes'
  
  // Default si no coincide nada
  return 'Otros'
}

// Utilities to parse and normalize CSV content according to user's rules
function parseDateDMY(input) {
  // Accept d/m/yy or dd/mm/yy and variations with '-', '.' and optional inner spaces
  if (!input && input !== 0) return null
  const trimmed = String(input).trim()
  const m = trimmed.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})/)
  if (!m) return null
  const d = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10)
  let y = parseInt(m[3], 10)
  if (isNaN(d) || isNaN(mo) || isNaN(y)) return null
  const year = (m[3].length === 2) ? 2000 + y : y
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  // Validate actual calendar date
  const dt = new Date(year, mo - 1, d)
  if (dt.getFullYear() !== year || (dt.getMonth() + 1) !== mo || dt.getDate() !== d) return null
  return `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseEuroDecimal(str) {
  if (str == null) return { ok: false }
  let s = String(str).trim().replace(/\s+/g, '')
  // If both separators appear, assume '.' thousands and ',' decimals
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else {
    s = s.replace(',', '.')
  }
  const f = Number(s)
  if (!isFinite(f)) return { ok: false }
  return { ok: true, value: f }
}

function safeSplitCSVLine(line, delimiter) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === delimiter && !inQuotes) {
      out.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function detectDelimiter(firstLine) {
  const candidates = [',', ';', '\t']
  let best = ','
  let bestCount = -1
  for (const d of candidates) {
    const count = firstLine.split(d).length - 1
    if (count > bestCount) { bestCount = count; best = d }
  }
  return best
}

function parseBankCSV(text) {
  // Remove BOM if present
  if (text && text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
  const lines = (text || '').split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return { rows: [], errors: ['CSV vacío'] }
  const delimiter = detectDelimiter(lines[0])
  const header = safeSplitCSVLine(lines[0], delimiter).map(h => h.trim().toLowerCase())
  const okHeader = (
    header.length >= 7 &&
    header[0].startsWith('fecha') && header[1].startsWith('fecha') && header[2].startsWith('concepto') &&
    header[3].startsWith('importe') && header[4].startsWith('moneda') && header[5].startsWith('saldo')
  )
  const errors = []
  if (!okHeader) errors.push('Encabezados inválidos o faltantes')

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = safeSplitCSVLine(lines[i], delimiter)
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
    r.isExpense = imp.ok && imp.value < 0
    
    // Asignar categoría automática basada en el concepto
    const conceptoCompleto = [r.description, r.extended_description].filter(Boolean).join(' ')
    r.category = categorizarPorConcepto(conceptoCompleto)
    r.supplier = 'Banco' // Proveedor por defecto, también editable
    
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
  // Use absolute value to match with database (stored as positive base_amount)
  const absoluteAmount = Math.abs(r.amount ?? 0)
  const normalizedDesc = (r.description || '').trim().replace(/\s+/g,' ')
  const sig = `${r.accounting_date}|${(-absoluteAmount).toFixed(2)}|${normalizedDesc}`
  console.log('🔍 [CSV Import] Firma generada:', sig)
  return sig
}

export default function ImportExpensesCSVModal({ isOpen, onClose, onImported }) {
  const { token } = useStore()
  const [step, setStep] = React.useState('select') // select | preview | importing | done
  const [_, setRawText] = React.useState('')
  const [parsed, setParsed] = React.useState({ rows: [], errors: [] })
  const [summary, setSummary] = React.useState(null)
  const [existingIndex, setExistingIndex] = React.useState(new Map())
  const [omitDuplicates, setOmitDuplicates] = React.useState(true)
  const [defaultCategory] = React.useState('Otros') // Fallback si categoría no detectada
  const [defaultSupplier] = React.useState('Banco') // Fallback si proveedor no detectado
  const [defaultTax, setDefaultTax] = React.useState(0)
  // Estado para las categorías y proveedores editables por fila
  const [rowCategories, setRowCategories] = React.useState({})
  const [rowSuppliers, setRowSuppliers] = React.useState({})

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
      console.log('🔍 [CSV Import] Índice de duplicados cargado:', map.size, 'gastos existentes')
      console.log('🔍 [CSV Import] Primeras 3 firmas:', Array.from(map.keys()).slice(0, 3))
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
      
      // Importar cada fila con su categoría y proveedor específicos
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        // Buscar el índice original de la fila en parsed.rows para obtener la categoría editada
        const originalIdx = parsed.rows.findIndex(row => 
          row.accounting_date === r.accounting_date && 
          row.description === r.description && 
          row.amount === r.amount
        )
        
        // Usar categoría/proveedor editado si existe, sino usar el de la fila (auto-detectado)
        const category = rowCategories[originalIdx] !== undefined ? rowCategories[originalIdx] : r.category
        const supplier = rowSuppliers[originalIdx] !== undefined ? rowSuppliers[originalIdx] : r.supplier
        
        const payload = {
          date: r.accounting_date,
          category: category || defaultCategory,
          description: r.extended_description ? `${r.description} — ${r.extended_description}` : r.description,
          supplier: supplier || defaultSupplier,
          base_amount: r.amount_abs, // CSV holds negative number; store absolute as base
          tax_rate: Number(defaultTax) || 0,
          // total derived in backend; marcar como pagado por defecto
          paid: true
        }
        await apiPost('/expenses', payload, token)
        imported++
      }
      toast.success(`Importados ${imported} gastos`)
      // Recargar índice de duplicados para futuras importaciones
      await fetchAllExpensesIndex()
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 240 }} className="bg-gray-900 text-gray-100 border border-gray-700 rounded-xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold truncate">Importar gastos desde CSV</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white ml-2 flex-shrink-0">✕</button>
            </div>

            <div className="overflow-y-auto flex-1">
              {step === 'select' && (
                <div className="p-3 sm:p-5 space-y-4">
                  <p className="text-xs sm:text-sm text-gray-300">Sube un archivo .csv con los encabezados: Fecha ctble, Fecha valor, Concepto, Importe, Moneda, Saldo, Moneda, Concepto ampliado</p>
                  <input type="file" accept=".csv" onChange={handleFile} className="block w-full text-sm" />
                </div>
              )}

              {step === 'preview' && summary && (
                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                {parsed.errors?.length > 0 && (
                  <div className="bg-red-900/20 border border-red-800 rounded p-3 text-red-400 text-sm">
                    <strong>Errores de archivo:</strong> {parsed.errors.join('; ')}
                  </div>
                )}
                {(() => {
                  const validExpenses = parsed.rows.filter(r => r.isExpense && r.errors.length === 0)
                  const duplicates = validExpenses.filter(r => {
                    const sig = rowSignature(r)
                    const isDup = existingIndex.has(sig)
                    if (isDup) {
                      console.log('🔍 [CSV Import] Duplicado encontrado:', sig)
                    }
                    return isDup
                  })
                  const toImport = getRowsToImport()
                  
                  return (
                    <div className="bg-blue-900/20 border border-blue-800 rounded p-3 text-blue-300 text-sm space-y-1">
                      <div><strong>Estado de importación:</strong></div>
                      <div>• Gastos válidos detectados: {validExpenses.length}</div>
                      {duplicates.length > 0 && (
                        <div>• Duplicados encontrados: {duplicates.length} {omitDuplicates ? '(se omitirán)' : '(se reemplazarán)'}</div>
                      )}
                      <div>• Gastos listos para importar: <strong>{toImport.length}</strong></div>
                      {toImport.length === 0 && validExpenses.length > 0 && (
                        <div className="text-yellow-400">⚠️ No hay gastos para importar porque todos son duplicados y tienes activada la opción "Omitir duplicados"</div>
                      )}
                    </div>
                  )
                })()} 
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-800/60 rounded p-2 sm:p-3">
                    <div className="text-xs sm:text-sm">Nº de gastos: <span className="font-semibold">{summary.count}</span></div>
                    <div className="text-xs sm:text-sm">Suma importes (negativa): <span className="font-semibold">{summary.sumNeg.toFixed(2)} EUR</span></div>
                    <div className="text-xs sm:text-sm">Suma absoluta: <span className="font-semibold">{summary.sumAbs.toFixed(2)} EUR</span></div>
                    <div className="text-xs sm:text-sm">Rango fechas: <span className="font-semibold break-all">{summary.range.min || '-'} – {summary.range.max || '-'}</span></div>
                  </div>
                  <div className="bg-gray-800/60 rounded p-2 sm:p-3 space-y-2">
                    <label className="flex items-center gap-2 text-xs sm:text-sm"><input type="checkbox" checked={omitDuplicates} onChange={e => setOmitDuplicates(e.target.checked)} className="flex-shrink-0" /> <span className="leading-tight">Omitir duplicados</span></label>
                    <div className="text-xs sm:text-sm">
                      <label className="flex flex-col gap-1">
                        <span className="text-gray-400">IVA por defecto (%)</span>
                        <input type="number" step="0.1" min="0" max="100" value={defaultTax} onChange={e=>setDefaultTax(e.target.value)} className="px-2 py-1 text-sm rounded bg-gray-900 border border-gray-700" />
                      </label>
                    </div>
                    {existingIndex.size>0 && (
                      <div className="text-xs text-gray-400">Detección cargada ({existingIndex.size} existentes)</div>
                    )}
                    <div className="text-xs text-blue-300 mt-2">
                      💡 Categorías auto-asignadas. Edita en tabla.
                    </div>
                  </div>
                </div>
                {/* Vista de tarjetas para móvil */}
                <div className="lg:hidden space-y-2">
                  {summary.preview.map((r, idx) => {
                    const dup = existingIndex.size ? existingIndex.has(rowSignature(r)) : false
                    const hasErrors = r.errors.length > 0
                    const willImport = r.isExpense && !hasErrors && (!dup || !omitDuplicates)
                    
                    const currentCategory = rowCategories[idx] !== undefined ? rowCategories[idx] : r.category
                    const currentSupplier = rowSuppliers[idx] !== undefined ? rowSuppliers[idx] : r.supplier
                    
                    let status = '', statusClass = ''
                    if (!r.isExpense) { status = '🚫 No es gasto'; statusClass = 'text-gray-400' }
                    else if (hasErrors) { status = '❌ Con errores'; statusClass = 'text-red-400' }
                    else if (dup && omitDuplicates) { status = '⚠️ Duplicado'; statusClass = 'text-yellow-400' }
                    else if (dup && !omitDuplicates) { status = '🔄 Reemplazar'; statusClass = 'text-orange-400' }
                    else { status = '✅ Importar'; statusClass = 'text-green-400' }
                    
                    return (
                      <div key={idx} className={`bg-gray-800/40 border border-gray-700 rounded p-3 space-y-2 ${!willImport ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-medium ${statusClass}`}>{status}</span>
                          <span className="text-xs text-gray-400">{r.accounting_date || '-'}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-200 line-clamp-2" title={r.description}>{r.description}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Categoría</label>
                            <ExpenseAutocomplete
                              value={currentCategory}
                              onChange={(newCategory) => setRowCategories(prev => ({ ...prev, [idx]: newCategory }))}
                              type="categories"
                              placeholder="Categoría..."
                              className="px-2 py-1.5 text-xs bg-gray-900 border border-gray-600 rounded w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Proveedor</label>
                            <ExpenseAutocomplete
                              value={currentSupplier}
                              onChange={(newSupplier) => setRowSuppliers(prev => ({ ...prev, [idx]: newSupplier }))}
                              type="suppliers"
                              placeholder="Proveedor..."
                              className="px-2 py-1.5 text-xs bg-gray-900 border border-gray-600 rounded w-full"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-100 tabular-nums">{(r.amount||0).toFixed(2)} €</span>
                          {r.errors.length > 0 && <span className="text-xs text-red-400">{r.errors.join('; ')}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Vista de tabla para desktop */}
                <div className="hidden lg:block overflow-auto border border-gray-800 rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-800/60 text-gray-300">
                      <tr>
                        <th className="text-left px-2 py-1">Estado</th>
                        <th className="text-left px-2 py-1">Fecha</th>
                        <th className="text-left px-2 py-1">Concepto</th>
                        <th className="text-left px-2 py-1 min-w-[150px]">Categoría</th>
                        <th className="text-left px-2 py-1 min-w-[150px]">Proveedor</th>
                        <th className="text-right px-2 py-1">Importe</th>
                        <th className="text-left px-2 py-1">Errores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.preview.map((r, idx) => {
                        const dup = existingIndex.size ? existingIndex.has(rowSignature(r)) : false
                        const hasErrors = r.errors.length > 0
                        const willImport = r.isExpense && !hasErrors && (!dup || !omitDuplicates)
                        
                        const currentCategory = rowCategories[idx] !== undefined ? rowCategories[idx] : r.category
                        const currentSupplier = rowSuppliers[idx] !== undefined ? rowSuppliers[idx] : r.supplier
                        
                        let status = '', statusClass = ''
                        if (!r.isExpense) { status = '🚫 No es gasto'; statusClass = 'text-gray-400' }
                        else if (hasErrors) { status = '❌ Con errores'; statusClass = 'text-red-400' }
                        else if (dup && omitDuplicates) { status = '⚠️ Duplicado (omitir)'; statusClass = 'text-yellow-400' }
                        else if (dup && !omitDuplicates) { status = '🔄 Duplicado (reemplazar)'; statusClass = 'text-orange-400' }
                        else { status = '✅ Se importará'; statusClass = 'text-green-400' }
                        
                        return (
                          <tr key={idx} className={`odd:bg-gray-900/40 ${!willImport ? 'opacity-60' : ''}`}>
                            <td className={`px-2 py-1 whitespace-nowrap ${statusClass}`}>{status}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{r.accounting_date || '-'}</td>
                            <td className="px-2 py-1 max-w-xs truncate" title={r.description}>{r.description}</td>
                            <td className="px-2 py-1">
                              <ExpenseAutocomplete
                                value={currentCategory}
                                onChange={(newCategory) => setRowCategories(prev => ({ ...prev, [idx]: newCategory }))}
                                type="categories"
                                placeholder="Categoría..."
                                className="px-1 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded w-full"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <ExpenseAutocomplete
                                value={currentSupplier}
                                onChange={(newSupplier) => setRowSuppliers(prev => ({ ...prev, [idx]: newSupplier }))}
                                type="suppliers"
                                placeholder="Proveedor..."
                                className="px-1 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded w-full"
                              />
                            </td>
                            <td className="px-2 py-1 text-right tabular-nums">{(r.amount||0).toFixed(2)}</td>
                            <td className="px-2 py-1 text-red-400 text-xs">{r.errors.join('; ')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
                  <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 rounded px-4 py-2 text-sm sm:text-base order-2 sm:order-1">Cancelar</button>
                  {(() => {
                    const toImport = getRowsToImport()
                    const canImport = toImport.length > 0
                    
                    return (
                      <button 
                        onClick={canImport ? importNow : undefined} 
                        disabled={!canImport}
                        className={`rounded px-4 py-2 text-sm sm:text-base order-1 sm:order-2 ${
                          canImport 
                            ? 'bg-primary hover:opacity-90' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                        title={!canImport ? 'No hay gastos válidos para importar' : ''}
                      >
                        {canImport 
                          ? `Importar ${toImport.length} gasto${toImport.length === 1 ? '' : 's'}` 
                          : 'No hay gastos'
                        }
                      </button>
                    )
                  })()} 
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
