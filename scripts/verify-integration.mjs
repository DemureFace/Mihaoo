/* global process */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')

const baseURL = process.env.RESPONSIVE_BASE_URL || 'http://127.0.0.1:5173'
assert(['127.0.0.1', 'localhost'].includes(new URL(baseURL).hostname))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const calls = []
const unexpected = []
let failCurrency = false
const reply = (route, body, status = 200, headers = {}) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*', ...headers },
    body: JSON.stringify(body),
  })
await context.route('**/*', async (route) => {
  const request = route.request()
  const url = new URL(request.url())
  const path = url.pathname
  if (url.origin === baseURL) return route.continue()
  if (['stylesheet', 'font', 'image'].includes(request.resourceType())) return route.abort()
  calls.push({
    path,
    method: request.method(),
    authorized: request.headers().authorization === 'Bearer isolated-contract-token',
    body: request.postData() ? request.postDataJSON() : null,
  })
  if (request.method() === 'OPTIONS') return reply(route, {})
  if (path === '/auth/profile')
    return reply(route, { sub: 'fixture-user', email: 'fixture@example.test', roles: [] })
  if (path === '/checklists')
    return reply(route, [
      {
        id: 1,
        title: 'Server fixture checklist',
        items: [{ id: 'one', text: 'Synthetic server item' }],
      },
    ])
  if (path === '/checklists/1/completions') return reply(route, { id: 10, checklistId: 1 })
  if (path === '/currency/sites') return reply(route, ['Moonwin', 'JeetCity'])
  if (path === '/currency/convert')
    return failCurrency
      ? reply(
          route,
          { error: { code: 'BAD_GATEWAY', message: 'Synthetic upstream unavailable' } },
          502,
        )
      : reply(route, {
          en: { default: '<span>€10</span>' },
          translations: { de: { default: '<span>10 €</span>' } },
        })
  if (path === '/banner-exports/inspect')
    return reply(route, {
      fileKey: 'fixture',
      sourceNodeId: '1:1',
      banners: [{ id: '1:2', name: 'Synthetic banner', width: 1200, height: 600, type: 'FRAME' }],
    })
  if (path === '/banner-exports') return reply(route, { id: 'fixture-job', status: 'pending' })
  if (path === '/banner-exports/fixture-job')
    return reply(route, { id: 'fixture-job', status: 'completed', progress: 100 })
  if (path === '/banner-exports/fixture-job/manifest')
    return reply(route, { formats: ['png'], banners: [] })
  if (path === '/banner-exports/fixture-job/download')
    return route.fulfill({
      contentType: 'application/zip',
      body: 'isolated zip fixture',
      headers: {
        'access-control-allow-origin': '*',
        'content-disposition': 'attachment; filename="fixture.zip"',
      },
    })
  unexpected.push(path)
  await route.abort()
})
await context.addInitScript(() => localStorage.setItem('accessToken', 'isolated-contract-token'))
const page = await context.newPage()
const runtimeErrors = []
page.on('pageerror', (error) => runtimeErrors.push(error.message))
const results = []
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
  await page.goto(baseURL + path)
  await page.locator('.preloader').waitFor({ state: 'hidden' })
}
try {
  await go('/responsive-showcase')
  await check('Service contracts, auth/error lifecycle and Signup backend policy', async () => {
    const result = await page.evaluate(async () => {
      const source = await (await fetch('/src/services/analytics.service.js')).text()
      const apiPath = source.match(/import api from "([^"]+)"/)?.[1]
      if (!apiPath) throw new Error('Cannot resolve the Vite API module')
      const { default: api } = await import(apiPath)
      const { analyticsService } = await import('/src/services/analytics.service.js')
      const banner = await import('/src/services/bannerExportService.js')
      const { default: Signup } = await import('/src/services/SignupValidations.js')
      const original = api.defaults.adapter
      const observations = {}
      const row = {
        id: 1,
        taskGroupId: 1,
        taskGroup: {
          title: 'Fixture',
          taskType: 'PROMO',
          platform: 'SS',
          reportDate: '2026-10-06',
        },
        brand: 'JC',
        storyPoints: 1,
      }
      try {
        api.defaults.adapter = async (config) => {
          observations.params = config.params
          return { data: { data: [row], total: 27 }, status: 200, headers: {}, config }
        }
        observations.tasks = await analyticsService.list({
          page: 1,
          brand: ['JC', 'MW'],
          executorId: [1, 2],
        })
        api.defaults.adapter = async (config) => ({ data: {}, status: 200, headers: {}, config })
        try {
          await analyticsService.list({})
          observations.malformedRejected = false
        } catch {
          observations.malformedRejected = true
        }

        api.defaults.adapter = async (config) => {
          observations.downloadAuthorized =
            config.headers.Authorization === 'Bearer isolated-contract-token'
          observations.downloadPath = config.url
          return {
            data: new Blob(['fixture']),
            status: 200,
            headers: { 'content-disposition': 'attachment; filename="fixture.zip"' },
            config,
          }
        }
        observations.filename = (await banner.downloadBannerExport('one')).filename

        const reject = (config, status, data) =>
          Promise.reject({ message: 'generic', config, response: { status, data } })
        api.defaults.adapter = (config) =>
          reject(config, 429, {
            error: { message: 'Figma rate limit', details: { retryAfterSeconds: 30 } },
          })
        try {
          await banner.inspectBannerExport('fixture')
        } catch (error) {
          observations.error = {
            message: error.message,
            status: error.status,
            retry: error.data.error.details.retryAfterSeconds,
          }
        }
        api.defaults.adapter = (config) => {
          localStorage.setItem('accessToken', 'newer-contract-token')
          return reject(config, 401, { error: { message: 'Old token expired' } })
        }
        try {
          await api.get('/tasks')
        } catch {
          observations.staleTokenPreserved =
            localStorage.getItem('accessToken') === 'newer-contract-token'
        }
        api.defaults.adapter = (config) =>
          reject(config, 401, { error: { message: 'Invalid credentials' } })
        try {
          await api.post('/auth/login', {})
        } catch {
          observations.loginFailurePreserved =
            localStorage.getItem('accessToken') === 'newer-contract-token'
        }
        let expired = false
        const listener = () => {
          expired = true
        }
        window.addEventListener('auth:expired', listener)
        try {
          await api.get('/tasks')
        } catch {
          observations.current401Cleared = !localStorage.getItem('accessToken') && expired
        }
        window.removeEventListener('auth:expired', listener)
        observations.passwordAccepted = !new Signup(
          'fixture@example.test',
          'abcdefgh!',
        ).checkValidations().password
        observations.passwordRejected = Boolean(
          new Signup('fixture@example.test', 'abcdefgh').checkValidations().password,
        )

        const { default: actions } = await import('/src/store/modules/auth/actions.js')
        const constants = await import('/src/store/storeconstants.js')
        localStorage.setItem('accessToken', 'isolated-contract-token')
        api.defaults.adapter = (config) =>
          reject(config, 502, { error: { message: 'Upstream unavailable' } })
        await actions[constants.FETCH_USER_ACTION]({ commit() {} })
        observations.outagePreserved =
          localStorage.getItem('accessToken') === 'isolated-contract-token'
      } finally {
        api.defaults.adapter = original
        localStorage.setItem('accessToken', 'isolated-contract-token')
      }
      return observations
    })
    assert.equal(result.tasks.items.length, 1)
    assert.equal(result.tasks.total, 27)
    assert.equal(result.tasks.hasNext, true)
    assert.equal(result.params.brand, 'JC,MW')
    assert.equal(result.params.executorId, '1,2')
    assert(result.malformedRejected)
    assert(result.downloadAuthorized)
    assert.equal(result.downloadPath, '/banner-exports/one/download')
    assert.equal(result.filename, 'fixture.zip')
    assert.deepEqual(result.error, { message: 'Figma rate limit', status: 429, retry: 30 })
    for (const key of [
      'staleTokenPreserved',
      'loginFailurePreserved',
      'current401Cleared',
      'passwordAccepted',
      'passwordRejected',
      'outagePreserved',
    ])
      assert(result[key], key)
  })
  await check('Concurrent reference data dispatches await one shared request', async () => {
    const result = await page.evaluate(async () => {
      const source = await (await fetch('/src/store/modules/analytics.js')).text()
      const servicePath = source
        .split('\n')
        .find((line) => line.includes('import { analyticsService }'))
        ?.split('"')[1]
      if (!servicePath) throw new Error('Cannot resolve analytics service')
      const { analyticsService } = await import(servicePath)
      const { default: module } = await import('/src/store/modules/analytics.js')
      const original = analyticsService.getReferenceData
      let calls = 0
      let release
      analyticsService.getReferenceData = () => {
        calls += 1
        return new Promise((resolve) => {
          release = resolve
        })
      }
      const state = module.state()
      const context = { state, commit: (name, value) => module.mutations[name](state, value) }
      try {
        const first = module.actions.loadReferenceData(context)
        const second = module.actions.loadReferenceData(context)
        let settled = false
        second.then(() => {
          settled = true
        })
        await Promise.resolve()
        const pending = !settled
        release({ brands: [], platforms: [], taskTypes: [] })
        await Promise.all([first, second])
        return { calls, pending, loaded: Boolean(state.referenceData) }
      } finally {
        analyticsService.getReferenceData = original
      }
    })
    assert.deepEqual(result, { calls: 1, pending: true, loaded: true })
  })
  await go('/checklists')
  await check(
    'Server checklists list and explicit completion payload, local definitions preserved',
    async () => {
      const stored = await page.evaluate(() => localStorage.getItem('cl:defs'))
      await page.getByRole('button', { name: 'Завантажити з API', exact: true }).click()
      await page.getByRole('heading', { name: 'Server fixture checklist' }).waitFor()
      await page.getByRole('button', { name: 'Заповнити', exact: true }).click()
      await page.getByRole('checkbox', { name: 'Synthetic server item' }).check()
      await page.getByRole('button', { name: 'Зберегти виконання на сервері', exact: true }).click()
      await page.getByRole('status').filter({ hasText: '#10' }).waitFor()
      assert.equal(await page.evaluate(() => localStorage.getItem('cl:defs')), stored)
      for (const width of [320, 768, 1440, 3840]) {
        await page.setViewportSize({ width, height: 900 })
        await page.waitForTimeout(100)
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
          ),
        )
      }
      const submitted = calls.find((x) => x.path === '/checklists/1/completions')
      assert(submitted.authorized)
      assert.deepEqual(submitted.body, { answers: [{ itemId: 'one', checked: true }] })
    },
  )
  await go('/currency-converter')
  await check(
    'Currency explicit server mode, response envelope and visible errors without local fallback',
    async () => {
      await page.locator('main textarea').first().fill('€10')
      await page.getByRole('button', { name: 'Local mode', exact: true }).click()
      await page.getByRole('button', { name: 'Convert', exact: true }).click()
      await page.waitForFunction(() =>
        document.querySelector('main textarea[readonly]').value.includes('"translations"'),
      )
      assert(calls.find((x) => x.path === '/currency/convert').authorized)
      for (const width of [320, 768, 1440, 3840]) {
        await page.setViewportSize({ width, height: 900 })
        await page.waitForTimeout(100)
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
          ),
        )
      }
      failCurrency = true
      await page.getByRole('button', { name: 'Convert', exact: true }).click()
      await page.getByRole('alert').filter({ hasText: 'Synthetic upstream unavailable' }).waitFor()
      assert.equal(await page.locator('main textarea[readonly]').inputValue(), '')
    },
  )
  await go('/banner-export')
  await check('Banner inspect/create/poll and authenticated ZIP download', async () => {
    await page.locator('main textarea').fill('https://www.figma.com/design/fixture/Fixture')
    await page.getByRole('button', { name: 'Load banners', exact: true }).click()
    await page.getByRole('button', { name: 'Select all', exact: true }).click()
    await page.getByRole('button', { name: 'Export selected banners', exact: true }).click()
    await page.getByRole('button', { name: 'Download ZIP', exact: true }).waitFor()
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download ZIP', exact: true }).click()
    assert((await download).suggestedFilename().endsWith('.zip'))
    assert(calls.filter((x) => x.path.startsWith('/banner-exports')).every((x) => x.authorized))
    const created = calls.find((x) => x.path === '/banner-exports' && x.method === 'POST')
    assert.equal(created.body.figmaFileKey, 'fixture')
    assert.equal(created.body.nodes[0].id, '1:2')
  })
  await check('No unexpected external requests', () => assert.deepEqual(unexpected, []))
  await check('No runtime JavaScript errors', () => assert.deepEqual(runtimeErrors, []))
} finally {
  await fs.mkdir('docs/integration/evidence', { recursive: true })
  await fs.writeFile(
    'docs/integration/evidence/contracts.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        browser: browser.version(),
        dataSource: 'isolated contract fixtures based on backend 6ef33fb; no live API',
        results,
        runtimeErrors,
      },
      null,
      2,
    ),
  )
  await browser.close()
}
if (results.some((x) => x.status !== 'PASS')) process.exitCode = 1
