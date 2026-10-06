/* global process */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { longText, map, checklist, responseFor } from '../tests/responsive/fixtures.mjs'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.RESPONSIVE_BASE_URL || 'http://127.0.0.1:5173'
assert(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname), 'Local server only')
const output = process.env.RESPONSIVE_OUTPUT || 'docs/responsive/evidence'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({
  channel: process.env.RESPONSIVE_BROWSER || 'chrome',
  headless: true,
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
  permissions: ['clipboard-read', 'clipboard-write'],
})
let mode = 'populated'
const unexpected = []
const intercept = async (route) => {
  const request = route.request(),
    url = new URL(request.url())
  const fixture = responseFor(url.pathname, request.method(), mode)
  if (fixture) {
    if (fixture.delay) await new Promise((resolve) => setTimeout(resolve, fixture.delay))
    await route.fulfill({
      status: fixture.status || 200,
      contentType: fixture.contentType || 'application/json',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'content-disposition',
        ...fixture.headers,
      },
      body: fixture.text || JSON.stringify(fixture.body),
    })
    return
  }
  if (url.origin === new URL(baseURL).origin) {
    await route.continue()
    return
  }
  // All unmatched external traffic is blocked; no fixture writes reach a real API.
  if (!['font', 'image', 'stylesheet'].includes(request.resourceType()))
    unexpected.push({ path: url.pathname, method: request.method() })
  await route.abort()
}
await context.route('**/*', intercept)
await context.addInitScript(
  ({ map, checklist }) => {
    localStorage.setItem('accessToken', 'isolated-responsive-fixture')
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'fixture@example.test' }))
    if (!localStorage.getItem('mihaoo:maps'))
      localStorage.setItem('mihaoo:maps', JSON.stringify([map]))
    if (!localStorage.getItem('cl:defs'))
      localStorage.setItem('cl:defs', JSON.stringify([checklist]))
    localStorage.setItem('cl:defs:ver', '3')
  },
  { map, checklist },
)
const page = await context.newPage()
page.setDefaultTimeout(12000)
const runtimeErrors = []
page.on('pageerror', (error) => runtimeErrors.push(error.message))
const results = []
const sizes = [
  [320, 568],
  [375, 667],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
  [3840, 2160],
]
async function check(name, fn) {
  try {
    await fn()
    results.push({ name, status: 'PASS' })
    console.log('PASS ' + name)
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message })
    console.log('FAIL ' + name + ': ' + error.message.slice(0, 250))
  }
}
async function go(route) {
  await page.goto(baseURL + route, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#app')?.textContent.trim())
  await page.locator('.preloader').waitFor({ state: 'hidden' })
  await page.waitForTimeout(120)
}
async function bounds() {
  const result = await page.evaluate(() => {
    const overflowing = []
    for (const e of document.querySelectorAll('main *, [role="dialog"] *')) {
      if (e.closest('[inert], [aria-hidden="true"]')) continue
      const r = e.getBoundingClientRect()
      if (!r.width || (r.right <= innerWidth + 1 && r.left >= -1)) continue
      let contained = false
      for (let parent = e.parentElement; parent; parent = parent.parentElement) {
        if (
          ['auto', 'scroll'].includes(getComputedStyle(parent).overflowX) ||
          parent.classList.contains('vue-flow')
        ) {
          contained = true
          break
        }
      }
      if (!contained) overflowing.push(e.tagName + ':' + String(e.className).slice(0, 120))
    }
    return {
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      overflowing: overflowing.slice(0, 8),
    }
  })
  assert(result.scroll <= result.width + 1, JSON.stringify(result))
  assert.deepEqual(result.overflowing, [], JSON.stringify(result))
}
async function matrix(label) {
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height })
    await page.waitForTimeout(80)
    await check(`${label} ${width}x${height}`, bounds)
  }
}
const routes = [
  '/analytics/tasks',
  '/analytics/report',
  '/tournaments',
  '/promo',
  '/checklists',
  '/checklists/responsive-fixture',
  '/banner-export',
  '/maps',
  '/maps/responsive-fixture',
  '/maps/responsive-fixture/edit',
  '/dashboard',
  '/home',
  '/news',
  '/calendar',
  '/currency-converter',
]
try {
  for (const route of routes) {
    await go(route)
    await matrix(route)
    if (['/analytics/tasks', '/maps/responsive-fixture/edit'].includes(route)) {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.screenshot({
        path: path.join(output, route.includes('maps') ? 'maps-320.png' : 'tasks-320.png'),
        fullPage: true,
      })
    }
  }
  await go('/analytics/tasks')
  await check('Navigation boundary 1023/1024/1025 and desktop collapse', async () => {
    for (const width of [1023, 1024, 1025]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(100)
      const opener = page.locator('[aria-controls="app-sidebar"]')
      if (width < 1024) {
        await opener.click()
        assert.equal(await page.locator('#app-sidebar').getAttribute('role'), 'dialog')
      } else {
        assert.equal(await page.locator('#app-sidebar').getAttribute('role'), null)
        assert.equal(await page.evaluate(() => document.body.style.overflow), '')
        await opener.click()
        await page.waitForTimeout(80)
        assert.equal(
          await page
            .locator('#app-sidebar')
            .evaluate((e) => Math.round(e.getBoundingClientRect().width)),
          64,
        )
        await opener.click()
      }
      await bounds()
    }
  })
  await check('Drawer focus, Tab loop, Escape and same-route dismissal', async () => {
    await page.setViewportSize({ width: 320, height: 568 })
    const opener = page.locator('[aria-controls="app-sidebar"]')
    await opener.click()
    assert.equal(await page.locator('main').evaluate((e) => e.inert), true)
    await page.keyboard.press('Shift+Tab')
    assert(await opener.evaluate((e) => e === document.activeElement))
    await page.keyboard.press('Tab')
    assert(await page.locator('#app-sidebar').evaluate((e) => e.contains(document.activeElement)))
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('#app-sidebar').evaluate((e) => e.inert), true)
    assert(await opener.evaluate((e) => e === document.activeElement))
    await opener.click()
    await page.getByRole('button', { name: 'Analytics', exact: true }).click()
    await page.getByRole('button', { name: 'Tasks List', exact: true }).click()
    assert.equal(await page.locator('#app-sidebar').evaluate((e) => e.inert), true)
    assert.equal(await page.evaluate(() => document.body.style.overflow), '')
  })
  await check('Filters validation, apply/reset and local table keyboard scroll', async () => {
    await page.locator('#analytics-from').fill('2026-10-10')
    await page.locator('#analytics-to').fill('2026-10-01')
    assert(await page.getByRole('button', { name: 'Застосувати', exact: true }).isDisabled())
    await page.getByRole('button', { name: 'Скинути', exact: true }).click()
    await page.locator('#analytics-search').fill('Fixture')
    await page.getByRole('button', { name: 'Застосувати', exact: true }).click()
    const scroll = page.locator('[aria-label="Таблиця задач"]')
    await scroll.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(150)
    assert(await scroll.evaluate((e) => e.scrollLeft > 0))
    await bounds()
  })
  await check('Task CSV download fixture', async () => {
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Експорт CSV', exact: true }).click()
    assert.equal((await download).suggestedFilename(), 'fixture.csv')
  })
  await check(
    'Task create modal resize preserves input, controls fit and close reachable',
    async () => {
      await page.getByRole('button', { name: '+ Нова задача', exact: true }).click()
      await page.locator('#create-task-title').waitFor()
      await page.locator('#create-task-title').fill(longText)
      await page.locator('#create-task-platform').selectOption('SS')
      await matrix('Task create modal')
      assert.equal(await page.locator('#create-task-title').inputValue(), longText)
      await page.setViewportSize({ width: 844, height: 390 })
      await bounds()
      const dialog = page.getByRole('dialog')
      await dialog.evaluate((e) => (e.scrollTop = e.scrollHeight))
      assert(await page.getByRole('button', { name: 'Close', exact: true }).isVisible())
      await page.getByRole('button', { name: 'Close', exact: true }).click()
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
    },
  )
  await check('Task details opens from native keyboard button', async () => {
    await page.getByRole('button', { name: 'Відкрити задачу #1', exact: true }).focus()
    await page.keyboard.press('Enter')
    await page.getByRole('dialog', { name: 'Деталі задачі' }).waitFor()
    await page.getByRole('heading', { name: longText, exact: true }).waitFor()
    await bounds()
    await page.keyboard.press('Escape')
  })
  await check(
    'Failed create retains input, prevents duplicate submit and allows retry',
    async () => {
      await page.getByRole('button', { name: '+ Нова задача', exact: true }).click()
      await page.locator('#create-task-description').fill('Synthetic save fixture')
      await page.locator('#create-task-platform').selectOption('SS')
      await page.locator('#create-task-type').selectOption('PROMO')
      await page.locator('#create-task-requester').selectOption('1')
      await page.locator('#create-brand-JC').check()
      await page.locator('#create-task-executor').selectOption('1')
      await page.locator('#create-task-sp').fill('1')
      const submit = page.getByRole('button', { name: 'Створити задачу', exact: true })
      await submit.click()
      assert(await submit.isDisabled())
      await page.getByText('Isolated save failure', { exact: true }).waitFor()
      assert.equal(
        await page.locator('#create-task-description').inputValue(),
        'Synthetic save fixture',
      )
      assert(await submit.isEnabled())
      await page.keyboard.press('Escape')
    },
  )
  await go('/analytics/report')
  await check('Weekly form local preview, no API-ready flags enabled', async () => {
    await page.getByRole('button', { name: 'Заповнити тижневий звіт', exact: true }).click()
    await page
      .locator('#weekly-report-planned-sp')
      .waitFor({ timeout: 2000 })
      .catch(() => {})
    await matrix('Weekly form')
    await page.setViewportSize({ width: 390, height: 844 })
    const numberFields = page.getByRole('dialog').locator('input[type="number"]')
    await numberFields.first().fill('10')
    await page.getByRole('button', { name: /Підготувати/ }).click()
    await page.getByText('Weekly Report Preview', { exact: true }).waitFor()
    await page.waitForTimeout(100)
    await bounds()
    await page.screenshot({ path: path.join(output, 'weekly-preview-390.png'), fullPage: true })
  })
  await go('/promo')
  await check('Promo generation and copy fixture; resize retains source text', async () => {
    await page.locator('#promo-task').fill('Synthetic fixture description')
    await page.locator('#promo-image').fill('https://example.test/banner.png')
    await page.getByRole('button', { name: 'Generate promo', exact: true }).click()
    await page.getByText('Generated content', { exact: true }).waitFor()
    await matrix('Generated promo')
    await page.getByRole('button', { name: 'Copy', exact: true }).first().click()
    assert((await page.evaluate(() => navigator.clipboard.readText())).includes('LongUnbrokenText'))
    assert.equal(await page.locator('#promo-task').inputValue(), 'Synthetic fixture description')
  })
  await go('/banner-export')
  await check('Banner inspect fixture and contained results', async () => {
    await page.locator('textarea').fill('https://www.figma.com/design/fixture/Fixture')
    await page.getByRole('button', { name: 'Load banners', exact: true }).click()
    await page.getByText('Detected banners', { exact: true }).waitFor()
    await matrix('Banner results')
  })
  for (const state of ['empty', 'error']) {
    mode = state
    await go('/analytics/tasks')
    await check(`Tasks ${state} state`, async () => {
      await page
        .getByText(state === 'error' ? 'Не вдалося завантажити задачі' : 'Задач не знайдено', {
          exact: true,
        })
        .waitFor()
      await bounds()
    })
  }
  mode = 'populated'
  await go('/tests/responsive/overlays.html')
  await check(
    'Nested dialogs: topmost Escape, shared scroll lock, focus and native step',
    async () => {
      await page.getByRole('button', { name: 'Open first', exact: true }).click()
      assert.equal(await page.locator('#step-field').getAttribute('step'), '0.1')
      assert.equal(
        await page.locator('#step-field').getAttribute('aria-describedby'),
        'field-context step-field-hint',
      )
      for (const id of ['error-select', 'error-textarea']) {
        assert.equal(await page.locator(`#${id}`).getAttribute('aria-invalid'), 'true')
        assert.equal(
          await page.locator(`#${id}`).getAttribute('aria-describedby'),
          `field-context ${id}-error`,
        )
        assert(await page.locator(`#${id}-error`).isVisible())
      }
      await page.getByRole('button', { name: 'Open second', exact: true }).click()
      await page.keyboard.press('Escape')
      await page.getByRole('dialog', { name: 'Second', exact: true }).waitFor({ state: 'detached' })
      assert.equal(await page.getByRole('dialog', { name: 'Second', exact: true }).count(), 0)
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
      assert(
        await page
          .getByRole('button', { name: 'Open second', exact: true })
          .evaluate((e) => e === document.activeElement),
      )
      await page.keyboard.press('Escape')
      await page.getByRole('dialog', { name: 'First', exact: true }).waitFor({ state: 'detached' })
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
    },
  )
  await go('/tests/responsive/overlays.html')
  await check('Drawer plus dialog ownership and KeepAlive deactivation cleanup', async () => {
    await page.getByRole('button', { name: 'Open fixture drawer', exact: true }).click()
    await page
      .getByRole('dialog', { name: 'Fixture drawer' })
      .getByRole('button', { name: 'Open first', exact: true })
      .click()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog', { name: 'First', exact: true }).waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
    await page.keyboard.press('Escape')
    await page.getByRole('dialog', { name: 'Fixture drawer' }).waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => document.body.style.overflow), '')
    await page.getByRole('button', { name: 'Open first', exact: true }).click()
    // Simulate route-driven deactivation, rather than clicking an inert background control.
    await page.evaluate(() =>
      document
        .querySelector('#deactivate')
        .dispatchEvent(new MouseEvent('click', { bubbles: true })),
    )
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    assert.equal(await page.getByRole('dialog').count(), 0)
    assert.equal(await page.evaluate(() => document.body.style.overflow), '')
  })
  await check('Other standard breakpoint boundaries and narrow landscape', async () => {
    await go('/analytics/tasks')
    for (const width of [639, 640, 641, 767, 768, 769, 1279, 1280, 1281, 1535, 1536, 1537]) {
      await page.setViewportSize({ width, height: 900 })
      await bounds()
    }
    await page.setViewportSize({ width: 844, height: 390 })
    await bounds()
  })
  await check('DPR 2 emulated viewport (not real Retina)', async () => {
    const retina = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    })
    try {
      await retina.route('**/*', intercept)
      await retina.addInitScript(() =>
        localStorage.setItem('accessToken', 'isolated-responsive-fixture'),
      )
      const tab = await retina.newPage()
      await tab.goto(baseURL + '/analytics/tasks', { waitUntil: 'domcontentloaded' })
      await tab.locator('#analytics-search').waitFor()
      await tab.locator('.preloader').waitFor({ state: 'hidden' })
      const metrics = await tab.evaluate(() => ({
        dpr: devicePixelRatio,
        zoom: visualViewport.scale,
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }))
      assert.equal(metrics.dpr, 2)
      assert.equal(metrics.zoom, 1)
      assert(metrics.scroll <= metrics.width + 1)
      await tab.screenshot({ path: path.join(output, 'tasks-dpr2.png') })
    } finally {
      await retina.close()
    }
  })
  await check('Shared layout width policy and mobile control sizing', async () => {
    await go('/promo')
    await page.setViewportSize({ width: 3840, height: 2160 })
    assert(
      await page
        .locator('main > div')
        .evaluate((element) => element.getBoundingClientRect().width <= 1920),
    )
    await page.setViewportSize({ width: 320, height: 568 })
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector('main')).marginLeft === '0px',
    )
    assert.equal(
      await page.locator('#promo-task').evaluate((element) => getComputedStyle(element).fontSize),
      '16px',
    )
    const generate = page.getByRole('button', { name: 'Generate promo', exact: true })
    assert(await generate.evaluate((element) => element.getBoundingClientRect().height >= 44))
    await bounds()
    await go('/maps/responsive-fixture/edit')
    await page.setViewportSize({ width: 3840, height: 2160 })
    assert(
      await page
        .locator('main > div')
        .evaluate((element) => element.getBoundingClientRect().width > 1920),
    )
    await bounds()
  })
  await go('/responsive-showcase')
  const moduleNavigation = page.getByRole('navigation', { name: 'Приклади модулів' })
  for (const module of ['Analytics', 'Promo / Tournament', 'Checklists', 'Banner Export', 'Maps']) {
    await moduleNavigation.getByRole('button', { name: module, exact: true }).click()
    await matrix(`Showcase ${module}`)
  }
  await check('Showcase container widths and isolated interactions', async () => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await moduleNavigation.getByRole('button', { name: 'Analytics', exact: true }).click()
    await page.getByRole('button', { name: 'Вузький · 375', exact: true }).click()
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="showcase-preview"]').getBoundingClientRect().width ===
        375,
    )
    assert.equal(
      await page
        .getByTestId('showcase-preview')
        .evaluate((element) => element.getBoundingClientRect().width),
      375,
    )
    await page.getByRole('button', { name: '+ Demo задача', exact: true }).click()
    await page.locator('#showcase-task-title').fill('Showcase test task')
    await page.setViewportSize({ width: 320, height: 568 })
    assert.equal(await page.locator('#showcase-task-title').inputValue(), 'Showcase test task')
    await page.getByRole('button', { name: 'Додати до demo', exact: true }).click()
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    await page.locator('#showcase-search').fill('Showcase test task')
    assert.equal(
      await page.locator('[aria-label="Демонстраційна таблиця задач"] tbody tr').count(),
      1,
    )
    await page.getByRole('button', { name: 'Деталі', exact: true }).click()
    await page.getByRole('dialog', { name: 'Деталі демонстраційної задачі' }).waitFor()
    await bounds()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    await moduleNavigation.getByRole('button', { name: 'Promo / Tournament', exact: true }).click()
    await page.getByRole('button', { name: 'Показати demo результат', exact: true }).click()
    await page.getByRole('button', { name: 'Copy', exact: true }).click()
    assert((await page.evaluate(() => navigator.clipboard.readText())).includes('data-demo="true"'))
    await bounds()
    await moduleNavigation.getByRole('button', { name: 'Checklists', exact: true }).click()
    await page.getByRole('checkbox').first().check()
    await page.waitForFunction(() => document.querySelector('progress').value === 1)
    assert.equal(await page.getByRole('progressbar').getAttribute('value'), '1')
    await page.getByRole('button', { name: 'Скинути demo', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('progress').value === 0)
    assert.equal(await page.getByRole('progressbar').getAttribute('value'), '0')
    await moduleNavigation.getByRole('button', { name: 'Banner Export', exact: true }).click()
    await page.locator('#showcase-format').selectOption('png')
    assert(
      (await page.locator('[aria-label="Демонстраційні банери"]').textContent()).includes('png'),
    )
    await moduleNavigation.getByRole('button', { name: 'Maps', exact: true }).click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'жодні карти не видалено' }).waitFor()
    await bounds()
    await page.screenshot({ path: path.join(output, 'showcase-maps-320.png'), fullPage: true })
    await page.setViewportSize({ width: 1440, height: 900 })
    await moduleNavigation.getByRole('button', { name: 'Analytics', exact: true }).click()
    await page.getByRole('button', { name: 'На всю ширину', exact: true }).click()
    await page.locator('#showcase-search').fill('')
    await page.screenshot({ path: path.join(output, 'showcase-desktop.png'), fullPage: true })
  })
  await check('No unexpected external requests', () => assert.deepEqual(unexpected, []))
  await check('No runtime JavaScript errors', () => assert.deepEqual(runtimeErrors, []))
} finally {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
  const diff = git('diff', '--', 'src', 'scripts', 'tests')
  const untracked = git('ls-files', '--others', '--exclude-standard', 'src', 'scripts', 'tests')
    .split('\n')
    .filter(Boolean)
  const hash = createHash('sha256').update(diff)
  for (const file of untracked) hash.update(file).update(await fs.readFile(file))
  const report = {
    date: new Date().toISOString(),
    revision: git('rev-parse', 'HEAD'),
    diffSHA256: hash.digest('hex'),
    dirty: git('status', '--short'),
    browser: browser.version(),
    engine: 'Chromium / installed Chrome, headless',
    os: `${os.platform()} ${os.release()} ${os.arch()}`,
    DPR: 1,
    zoom: '100% (visualViewport.scale=1); no real browser zoom asserted',
    dataSource: 'isolated fixture, external traffic intercepted',
    results,
    unverified: [
      'Real Safari/iPhone and virtual keyboard',
      'Real backend/API integration',
      '200% native browser zoom',
      'Real Retina monitor',
    ],
    runtimeErrors,
    unexpected,
  }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n')
  await browser.close()
  console.log(
    `Recorded ${results.length} checks; ${results.filter((r) => r.status === 'FAIL').length} failed`,
  )
  if (results.some((r) => r.status === 'FAIL')) process.exitCode = 1
}
