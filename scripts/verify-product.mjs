/* global process */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { map, checklist } from '../tests/responsive/fixtures.mjs'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.RESPONSIVE_BASE_URL || 'http://127.0.0.1:5173'
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
})
let loginCalls = 0
const unexpected = []
await context.route('**/*', async (route) => {
  const request = route.request(),
    url = new URL(request.url())
  if (url.origin === new URL(base).origin) return route.continue()
  if (['font', 'stylesheet', 'image'].includes(request.resourceType())) return route.abort()
  if (url.pathname === '/auth/login') {
    loginCalls += 1
    await new Promise((resolve) => setTimeout(resolve, 500))
    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: { message: 'Synthetic invalid credentials' } }),
    })
  }
  unexpected.push(url.pathname)
  await route.abort()
})
await context.addInitScript(
  ({ map, checklist }) => {
    if (!localStorage.getItem('mihaoo:maps'))
      localStorage.setItem('mihaoo:maps', JSON.stringify([map]))
    if (!localStorage.getItem('cl:defs'))
      localStorage.setItem(
        'cl:defs',
        JSON.stringify([
          { ...checklist, items: [{ id: 'plain', text: 'Plain checklist item without type' }] },
        ]),
      )
    localStorage.setItem('cl:defs:ver', '3')
  },
  { map, checklist },
)
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
const results = []
const output = 'docs/product/evidence'
await fs.mkdir(output, { recursive: true })
async function check(name, fn) {
  try {
    await fn()
    results.push({ name, status: 'PASS' })
    console.log('PASS', name)
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message })
    console.log('FAIL', name, error.message)
  }
}
async function go(path) {
  await page.goto(base + path)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
}
async function bounds() {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
    ),
  )
}
try {
  await go('/dashboard')
  await check('Dashboard content, links and responsive widths', async () => {
    await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor()
    assert.equal(await page.locator('main a[aria-label^="Відкрити"]').count(), 6)
    for (const width of [320, 375, 390, 768, 1024, 1280, 1440, 1920, 2560, 3840]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(100)
      await bounds()
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.screenshot({ path: output + '/dashboard-1440.png', fullPage: true })
  })
  await check('Sidebar hover and active controls have readable contrast', async () => {
    const sidebar = page.locator('#app-sidebar')
    for (const label of ['Dashboard', 'Tournament', 'Promo', 'Banner Export', 'Responsive']) {
      const button = sidebar.getByRole('button', { name: label, exact: true })
      await button.hover()
      await page.waitForTimeout(250)
      const contrast = await button.evaluate((element) => {
        const rgb = (value) =>
          value
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map(Number)
        const luminance = (values) =>
          values
            .map((v) => {
              v /= 255
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
            })
            .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0)
        const text =
          [...element.querySelectorAll('span')].find(
            (e) => e.textContent.trim() === element.textContent.trim(),
          ) || element
        function background(node) {
          if (!node) return [255, 255, 255]
          const channels = getComputedStyle(node)
            .backgroundColor.match(/[\d.]+/g)
            .map(Number)
          const alpha = channels[3] ?? 1
          const behind = background(node.parentElement)
          return channels
            .slice(0, 3)
            .map((value, index) => value * alpha + behind[index] * (1 - alpha))
        }
        const a = luminance(rgb(getComputedStyle(text).color)),
          b = luminance(background(element))
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      })
      assert(contrast >= 4.5, `${label} contrast ${contrast}`)
    }
  })
  await check(
    'Login password controls, link styles, validation and duplicate-submit guard',
    async () => {
      await page.getByRole('banner').getByRole('button', { name: 'Login', exact: true }).click()
      const dialog = page.getByRole('dialog', { name: 'Login', exact: true })
      await dialog.waitFor()
      const register = dialog.getByRole('button', { name: 'Register', exact: true })
      const style = await register.evaluate((e) => ({
        border: getComputedStyle(e).borderColor,
        background: getComputedStyle(e).backgroundColor,
      }))
      assert.equal(style.border, 'rgba(0, 0, 0, 0)')
      assert.equal(style.background, 'rgba(0, 0, 0, 0)')
      assert.equal(
        await dialog.getByRole('button', { name: 'Forgot Password?', exact: true }).count(),
        0,
      )
      await page.locator('#login-password').fill('password-fixture')
      await dialog.getByRole('button', { name: 'Show password', exact: true }).click()
      assert.equal(await page.locator('#login-password').getAttribute('type'), 'text')
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        const fit = await dialog
          .getByRole('button', { name: 'Hide password', exact: true })
          .evaluate((button) => {
            const field = document.querySelector('#login-password')
            const a = field.getBoundingClientRect(),
              b = button.getBoundingClientRect()
            return (
              b.left >= a.left &&
              b.right <= a.right + 1 &&
              b.height <= a.height + 1 &&
              parseFloat(getComputedStyle(field).paddingRight) >= b.width
            )
          })
        assert(fit)
        await bounds()
      }
      await dialog.getByRole('button', { name: 'Hide password', exact: true }).click()
      await page.locator('#login-email').fill('fixture@example.test')
      await dialog.getByRole('button', { name: 'Login', exact: true }).click()
      await page
        .locator('#login-password')
        .evaluate((e) =>
          e.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
        )
      await dialog.getByRole('alert').filter({ hasText: 'Synthetic invalid credentials' }).waitFor()
      assert.equal(loginCalls, 1)
      assert.equal(await page.locator('#login-password').inputValue(), 'password-fixture')
      await register.click()
      await page.locator('#signup-password').waitFor()
      await page
        .getByText('Minimum 8 characters, at least one Latin letter', { exact: false })
        .waitFor()
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'detached' })
    },
  )
  await go('/news')
  await check('News search, category, empty/reset and details', async () => {
    assert.equal(await page.locator('main article').count(), 4)
    await page.getByRole('button', { name: 'Tools', exact: true }).click()
    await page.waitForFunction(() => document.querySelectorAll('main article').length === 2)
    await page.locator('#news-search').fill('nothingmatchesfixture')
    await page.getByRole('heading', { name: 'Оновлень не знайдено' }).waitFor()
    await page.getByRole('button', { name: 'Скинути фільтри', exact: true }).click()
    await page.waitForFunction(() => document.querySelectorAll('main article').length === 4)
    await page.locator('main summary').first().click()
    assert(
      await page
        .locator('main details')
        .first()
        .evaluate((e) => e.open),
    )
    await page.setViewportSize({ width: 320, height: 568 })
    await page.waitForTimeout(100)
    await bounds()
    await page.screenshot({ path: output + '/news-320.png', fullPage: true })
  })
  await go('/checklists/responsive-fixture')
  await check('Plain checklist mark-all/reset and cached Escape cleanup', async () => {
    await page.getByRole('button', { name: 'Позначити все', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('main input[type="checkbox"]').checked)
    await page.getByRole('button', { name: 'Скинути', exact: true }).click()
    await page.waitForFunction(() => !document.querySelector('main input[type="checkbox"]').checked)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator('#app-sidebar').getByRole('button', { name: 'News', exact: true }).click()
    await page.waitForURL('**/news')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    assert.equal(new URL(page.url()).pathname, '/news')
  })
  await go('/maps')
  await check('Local Maps duplicate, search and delete', async () => {
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('mihaoo:maps')).length)
    await page.getByRole('button', { name: 'Duplicate', exact: true }).first().click()
    await page.waitForFunction(
      (count) => JSON.parse(localStorage.getItem('mihaoo:maps')).length === count + 1,
      before,
    )
    await page.locator('input[type="search"]').fill('Copy')
    await page.waitForFunction(() => document.querySelectorAll('main article').length === 1)
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.waitForFunction(
      (count) => JSON.parse(localStorage.getItem('mihaoo:maps')).length === count,
      before,
    )
  })
  await check('Map import validation, JSON roundtrip and undo/redo', async () => {
    const result = await page.evaluate(async () => {
      const { readMapImport, createMapExport } = await import('/src/utils/mapFile.js')
      const { useMapHistory } = await import('/src/composables/useMapHistory.js')
      const rejected = []
      for (const text of ['null', '[]', '{"title":42,"nodes":[],"edges":[]}']) {
        try {
          await readMapImport({ text: async () => text })
          rejected.push(false)
        } catch {
          rejected.push(true)
        }
      }
      const payload = createMapExport({ title: 'Fixture', nodes: [], edges: [] })
      const imported = await readMapImport({ text: async () => JSON.stringify(payload) })
      const h = useMapHistory()
      h.resetHistory({ nodes: [1] })
      h.checkpoint({ nodes: [1, 2] })
      return { rejected, title: imported.title, undo: h.undo(), redo: h.redo() }
    })
    assert.deepEqual(result.rejected, [true, true, true])
    assert.equal(result.title, 'Fixture')
    assert.deepEqual(result.undo, { nodes: [1] })
    assert.deepEqual(result.redo, { nodes: [1, 2] })
  })
  await check('Corrupt cached user does not crash application', async () => {
    await page.evaluate(() => localStorage.setItem('user', '{broken'))
    await go('/dashboard')
    await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor()
  })
  await check('No unexpected API requests or runtime errors', () => {
    assert.deepEqual(unexpected, [])
    assert.deepEqual(errors, [])
  })
} finally {
  await fs.writeFile(
    output + '/results.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        browser: browser.version(),
        source: 'isolated local browser context and synthetic auth failure; no live backend',
        results,
        errors,
        unexpected,
      },
      null,
      2,
    ),
  )
  await browser.close()
}
if (results.some((result) => result.status !== 'PASS')) process.exitCode = 1
