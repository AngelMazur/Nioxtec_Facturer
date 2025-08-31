import { test, expect } from '@playwright/test'

test('Documentos de Cliente: enlaces sin token', async ({ page, baseURL }) => {
  // Ir a la app
  await page.goto(baseURL || 'https://app.nioxtec.es', { waitUntil: 'domcontentloaded' })

  // Navegar a Clientes si existe ruta directa
  // Asumimos que la página por defecto lista clientes; si hay menú, intenta localizar enlace "Clientes"
  const clientesLink = page.locator('a:has-text("Clientes")').first()
  if (await clientesLink.count()) {
    await clientesLink.click()
  }

  // Esperar a que se renderice listado y abrir el primer cliente
  // Usar elemento que contiene listado de clientes; seleccionar el primer item clicable
  const firstClient = page.locator('main li, main .cursor-pointer').first()
  await expect(firstClient).toBeVisible({ timeout: 15000 })
  await firstClient.click()

  // Cambiar a la pestaña Documentacion/Documentos si está presente
  const docTab = page.locator('button:has-text("Documentacion"), button:has-text("Documentación")').first()
  if (await docTab.count()) {
    await docTab.click()
  }

  // Esperar título "Documentos" y recoger enlaces
  const documentosHeader = page.locator('text=Documentos').first()
  await expect(documentosHeader).toBeVisible({ timeout: 10000 })

  const docLinks = page.locator('a.underline').all()
  const count = await page.locator('a.underline').count()
  expect(count).toBeGreaterThan(0)

  // Validar que ninguno contiene token= en el href
  const hrefs = await page.locator('a.underline').evaluateAll(nodes => nodes.map(n => n.getAttribute('href') || ''))
  for (const href of hrefs) {
    expect(href).not.toContain('token=')
  }
})

