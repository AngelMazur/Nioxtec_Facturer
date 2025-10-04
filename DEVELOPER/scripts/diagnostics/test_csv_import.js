/**
 * Test para validar detección de duplicados en importación CSV
 * 
 * Este script simula el comportamiento de rowSignature y fetchAllExpensesIndex
 * para verificar que las firmas coincidan correctamente
 */

// Simular datos de CSV (como vienen del archivo)
const csvExpense = {
  accounting_date: '2025-09-30',
  amount: -87.61, // Negativo en CSV
  description: '052107281319 TGSS. COTIZACION 005 R.E....'
}

// Simular datos de BD (como se almacenan)
const dbExpense = {
  date: '2025-09-30',
  base_amount: 87.61, // Positivo en BD (valor absoluto)
  description: '052107281319 TGSS. COTIZACION 005 R.E....'
}

// Función rowSignature (del CSV)
function rowSignature(r) {
  const absoluteAmount = Math.abs(r.amount ?? 0)
  const normalizedDesc = (r.description || '').trim().replace(/\s+/g,' ')
  return `${r.accounting_date}|${(-absoluteAmount).toFixed(2)}|${normalizedDesc}`
}

// Función que construye firma desde BD (como en fetchAllExpensesIndex)
function dbSignature(e) {
  const amount = -Math.abs(Number(e.base_amount || 0))
  const normalizedDesc = (e.description || '').trim().replace(/\s+/g,' ')
  return `${e.date}|${amount.toFixed(2)}|${normalizedDesc}`
}

// Test
console.log('🧪 Test de detección de duplicados\n')
console.log('📄 CSV Expense:', csvExpense)
console.log('💾 DB Expense:', dbExpense)
console.log('\n--- Firmas generadas ---')

const csvSig = rowSignature(csvExpense)
const dbSig = dbSignature(dbExpense)

console.log('CSV Signature:', csvSig)
console.log('DB Signature: ', dbSig)
console.log('\n--- Resultado ---')

if (csvSig === dbSig) {
  console.log('✅ ÉXITO: Las firmas coinciden - El duplicado SERÁ detectado')
  console.log('✅ La importación del mismo gasto será bloqueada correctamente')
} else {
  console.log('❌ ERROR: Las firmas NO coinciden - El duplicado NO será detectado')
  console.log('❌ Se permitirá importar el mismo gasto múltiples veces')
}

// Test con diferentes variaciones de espacios
console.log('\n\n🧪 Test de normalización de descripción\n')

const testCases = [
  {
    csv: { accounting_date: '2025-09-30', amount: -87.61, description: 'TGSS.  COTIZACION   005' },
    db: { date: '2025-09-30', base_amount: 87.61, description: 'TGSS. COTIZACION 005' }
  },
  {
    csv: { accounting_date: '2025-09-30', amount: -87.61, description: '  TGSS. COTIZACION 005  ' },
    db: { date: '2025-09-30', base_amount: 87.61, description: 'TGSS. COTIZACION 005' }
  }
]

testCases.forEach((test, i) => {
  const csvSig = rowSignature(test.csv)
  const dbSig = dbSignature(test.db)
  const match = csvSig === dbSig
  console.log(`Test ${i+1}: ${match ? '✅' : '❌'} (CSV: "${test.csv.description}" vs DB: "${test.db.description}")`)
})

console.log('\n\n🎯 Para verificar en la aplicación:')
console.log('1. Abre la consola del navegador (F12)')
console.log('2. Importa un CSV con un gasto')
console.log('3. Sin cerrar el modal, vuelve a importar el MISMO CSV')
console.log('4. Deberías ver "⚠️ Duplicado" en el estado del gasto')
console.log('5. El contador debe mostrar "Duplicados encontrados: 1"')
