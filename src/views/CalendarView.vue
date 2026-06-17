<template>
  <div class="wrap">
    <header class="top">
      <h1>Calendar — Rewards & Rules</h1>

      <div class="row">
        <label class="field">
          <span>Site</span>
          <select v-model="site">
            <option v-for="s in sites" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>

        <div class="controls">
          <button class="btn" @click="presetDays(12)">Preset 12</button>
          <button class="btn" @click="presetDays(25)">Preset 25</button>
          <button class="btn" @click="addDay">Add day</button>
          <button class="btn" @click="removeDay" :disabled="days.length <= 1">Remove day</button>
          <button class="btn primary" @click="generateMain">Generate</button>
        </div>

        <div class="langbar">
          <button
            v-for="code in translationButtons[site] || []"
            :key="code"
            class="chip"
            :class="{ active: selectedLang === code }"
            @click="generateTranslation(code)"
          >
            {{ code }}
          </button>
        </div>
      </div>
    </header>

    <main class="grid">
      <section class="card">
        <h2>Days</h2>

        <div class="day" v-for="(d, i) in days" :key="d.id">
          <div class="dayHdr">
            <div class="idx">Day {{ i + 1 }}</div>
          </div>

          <label class="field">
            <span>Reward (HTML allowed)</span>
            <textarea v-model="d.reward" class="ta" rows="3" />
          </label>

          <label class="field">
            <span>Rules (HTML allowed)</span>
            <textarea v-model="d.rules" class="ta" rows="3" />
          </label>
        </div>
      </section>

      <section class="card">
        <div class="outHdr">
          <h2>EN Output</h2>
          <button class="btn" :disabled="!outEN.trim()" @click="copy(outEN)">Copy</button>
        </div>
        <textarea class="ta" rows="10" readonly :value="outEN" />

        <div class="outHdr" style="margin-top: 12px">
          <h2>{{ selectedLang ? selectedLang.toUpperCase() : 'TR' }} Output</h2>
          <button class="btn" :disabled="!outTR.trim()" @click="copy(outTR)">Copy</button>
        </div>
        <textarea class="ta" rows="10" readonly :value="outTR" />
      </section>
    </main>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'

  /* ---------- storage ---------- */
  function useLocalStorageRef(key, initial) {
    const raw = localStorage.getItem(key)
    const state = ref(raw ? JSON.parse(raw) : initial)
    watch(state, (v) => localStorage.setItem(key, JSON.stringify(v)), { deep: true })
    return state
  }
  async function copy(text) {
    await navigator.clipboard.writeText(text || '')
  }

  /* ---------- data ---------- */
  const siteModes = {
    Winorio: ['nz', 'pt', 'fr', 'gb', 'gr', 'de', 'default'],
    Spinrise: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    JeetCity: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    Moonwin: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    SlotsGallery: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    BohoCasino: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
  }

  const translationButtons = {
    Moonwin: ['de', 'en-au', 'fr', 'it', 'no'],
    JeetCity: ['de', 'en-au', 'fr', 'it', 'no'],
    Winorio: ['de', 'el', 'fr', 'pt'],
    Spinrise: ['de', 'en-au', 'fr', 'it', 'no'],
    SlotsGallery: ['de', 'en-au', 'fr', 'it', 'no'],
    BohoCasino: ['de', 'en-au', 'fr', 'it', 'no'],
  }

  const mapDefaultByTarget = {
    de: 'de',
    'en-au': 'au',
    fr: 'fr',
    it: 'it',
    no: 'no',
    el: 'gr',
    pt: 'pt',
  }

  const conversionRules = {
    en: { rate: 1, symbol: '€', position: 'before', separator: ',', decimal: '.' },
    au: { rate: 1.5, symbol: '$', position: 'before', separator: ',', decimal: '.' },
    nz: { rate: 1.5, symbol: '$', position: 'before', separator: ',', decimal: '.' },
    ca: { rate: 1.5, symbol: '$', position: 'before', separator: ',', decimal: '.' },
    de: { rate: 1, symbol: '€', position: 'after', separator: '.', decimal: ',' },
    fr: { rate: 1, symbol: '€', position: 'after', separator: ',', decimal: '.' },
    it: { rate: 1, symbol: '€', position: 'before', separator: ',', decimal: '.' },
    no: { rate: 10, symbol: 'kr', position: 'after', separator: ',', decimal: '.' },
    pt: { rate: 1, symbol: '€', position: 'after', separator: '.', decimal: ',' },
    gr: { rate: 1, symbol: '€', position: 'after', separator: ',', decimal: '.' },
    et: {
      rate: 1,
      symbol: '€',
      position: 'after',
      separator: ' ',
      decimal: ',',
      spaceBefore: true,
    },
    fi: {
      rate: 1,
      symbol: '€',
      position: 'after',
      separator: ' ',
      decimal: ',',
      spaceBefore: true,
    },
    ae: { rate: 1, symbol: '$', position: 'before', separator: ',', decimal: '.' },
    at: { rate: 1, symbol: '€', position: 'after', separator: '.', decimal: ',' },
    ch: { rate: 1, symbol: '€', position: 'after', separator: '.', decimal: ',' },
    gb: { rate: 1, symbol: '£', position: 'before', separator: ',', decimal: '.' },
  }
  const localesWithSpaceAfter = ['de', 'at', 'ch', 'no', 'et', 'fi']

  /* ---------- currency processor ---------- */
  function parseNumberLoose(amountStr) {
    const s = String(amountStr || '').replace(/\s+/g, '')
    const ld = s.lastIndexOf('.')
    const lc = s.lastIndexOf(',')
    const li = Math.max(ld, lc)

    let normalized
    if (li >= 0 && s.length - li <= 3) {
      normalized = parseFloat(s.replace(/[.,]/g, (_ch, idx) => (idx === li ? '.' : '')))
    } else {
      normalized = parseFloat(s.replace(/[.,]/g, ''))
    }
    return Number.isFinite(normalized) ? normalized : null
  }

  function formatNumber(val, locale) {
    const r = conversionRules[locale] || conversionRules.en
    const n = locale === 'no' ? Math.round(val) : val
    const fixed = locale === 'no' ? String(n) : Number(n).toFixed(2)
    const [intRaw, fracRaw = '00'] = fixed.split('.')
    const sign = intRaw.startsWith('-') ? '-' : ''
    const int = intRaw.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, r.separator)
    return locale === 'no' ? sign + int : sign + int + r.decimal + fracRaw
  }

  function convertAmount(val, locale) {
    const r = conversionRules[locale] || conversionRules.en
    return val * r.rate
  }

  function placeCurrency(formatted, locale) {
    const r = conversionRules[locale] || conversionRules.en
    if (r.position === 'before') return r.symbol + formatted
    if (localesWithSpaceAfter.includes(locale) || r.spaceBefore) return formatted + ' ' + r.symbol
    return formatted + r.symbol
  }

  function processText(text, locale) {
    const pattern =
      /([€$£])\s?(\d[\d.,\s]*)|(\d[\d.,\s]*)\s*(€|\$|£|kr|eur|usd|cad|aud|nzd|nok|chf|gbp)/gi

    let out = String(text || '').replace(pattern, (m, sb, v1, v2) => {
      const amountStr = sb ? v1 : v2
      if (!amountStr || !/\d/.test(amountStr)) return m

      const normalized = parseNumberLoose(amountStr)
      if (normalized == null) return m

      const conv = convertAmount(normalized, locale)
      const formatted = formatNumber(conv, locale)
      return placeCurrency(formatted, locale)
    })

    out = out
      .replace(/([€$£]\s?\d[\d.,]*)(?=\p{L})/gu, '$1 ')
      .replace(/(\d[\d.,]*\s?(?:€|\$|£|kr))(?=\p{L})/gu, '$1 ')

    if (locale === 'au') {
      out = out
        .replace(/(^|[^A-Za-z])slots(?=([^A-Za-z]|$))/gi, (_m, p) => p + 'pokies')
        .replace(/(^|[^A-Za-z])slot(?=([^A-Za-z]|$))/gi, (_m, p) => p + 'pokie')
    }
    return out
  }

  /* ---------- translator (fixed: declared once, works, caches) ---------- */
  const CAL_GT_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'
  const CAL_GT_KEY = 'AIzaSyCkYo31T4oaHz0itTvwZRCcJ31wATJy9yI'
  const calTranslateCache = new Map()

  function calProtectTokens(text) {
    if (!text) return { masked: '', map: [] }
    let idx = 0
    const map = []
    const masked = String(text).replace(/(\d[\d\s.,]*\d|\d+|%|€|\$|£|A\$|CA\$|NZ\$|kr)/g, (m) => {
      const token = `[[T${idx++}]]`
      map.push(m)
      return token
    })
    return { masked, map }
  }

  function calRestoreTokens(text, map) {
    if (!text || !map || !map.length) return text
    return String(text).replace(/\[\[\s*[TΤτ]\s*(\d+)\s*\]\]/g, (_m, i) => {
      const v = map[+i]
      return v == null ? '' : v
    })
  }

  function calDecodeBasicEntities(s) {
    if (!s) return s
    return String(s)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  }

  function calNormalizeBr(s) {
    if (!s) return s
    return String(s).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  }

  async function calTranslateRaw(text, target) {
    if (!text || !String(text).trim()) return text
    let t = String(target || '').toLowerCase()
    const cacheKey = `${t}\u0000${text}`
    if (calTranslateCache.has(cacheKey)) return calTranslateCache.get(cacheKey)

    if (t === 'en-au') t = 'en'
    if (t === 'gr') t = 'el'

    const body = JSON.stringify({ q: text, target: t.replace(/-.+$/, '') })

    try {
      const resp = await fetch(`${CAL_GT_ENDPOINT}?key=${CAL_GT_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const data = await resp.json()
      const out = data?.data?.translations?.[0]?.translatedText ?? text
      calTranslateCache.set(cacheKey, out)
      return out
    } catch {
      return text
    }
  }

  async function translatePreserve(text, target) {
    if (!text) return text
    const src = String(text)
    const tokens = calProtectTokens(src)

    let translated = await calTranslateRaw(tokens.masked, target)
    translated = calRestoreTokens(translated, tokens.map)
    translated = calDecodeBasicEntities(translated)
    translated = translated.replace(/\s*\[\[\s*[TΤτ]\s*\d+\s*\]\]\s*/g, '')
    return calNormalizeBr(translated)
  }

  /* ---------- state ---------- */
  const sites = computed(() => Object.keys(siteModes))
  const site = useLocalStorageRef('cal.site', 'Moonwin')
  const days = useLocalStorageRef('cal.days', [{ id: crypto.randomUUID(), reward: '', rules: '' }])
  const selectedLang = useLocalStorageRef('cal.lang', 'de')
  const outEN = ref('')
  const outTR = ref('')
  const isTranslating = ref(false)

  function presetDays(n) {
    const arr = []
    for (let i = 0; i < n; i++) arr.push({ id: crypto.randomUUID(), reward: '', rules: '' })
    days.value = arr
  }

  function addDay() {
    days.value = [...days.value, { id: crypto.randomUUID(), reward: '', rules: '' }]
  }

  function removeDay() {
    if (days.value.length <= 1) return
    days.value = days.value.slice(0, -1)
  }

  function collectDays() {
    return days.value.map((d) => ({
      reward: String(d.reward || '').trim(),
      rules: String(d.rules || '').trim(),
    }))
  }

  function buildOutputForLocales(dayList, locales) {
    const out = dayList.map((d) => ({
      reward: Object.fromEntries(locales.map((loc) => [loc, d.reward])),
      rules: Object.fromEntries(locales.map((loc) => [loc, d.rules])),
    }))
    return JSON.stringify(out, null, 2)
  }

  function generateMain() {
    const locales = siteModes[site.value] || ['default']
    outEN.value = buildOutputForLocales(collectDays(), locales)
  }

  async function generateTranslation(target) {
    if (isTranslating.value) return
    isTranslating.value = true
    selectedLang.value = target

    try {
      const locales = siteModes[site.value] || ['default']
      const list = collectDays()

      const translatedDays = await Promise.all(
        list.map(async (d) => {
          const [trReward, trRules] = await Promise.all([
            translatePreserve(d.reward, target),
            translatePreserve(d.rules, target),
          ])

          const rewardObj = {}
          const rulesObj = {}

          for (const loc of locales) {
            let fmtLoc = loc === 'default' ? mapDefaultByTarget[target] || 'en' : loc
            if (fmtLoc === 'default') fmtLoc = 'en'
            rewardObj[loc] = processText(trReward, fmtLoc)
            rulesObj[loc] = processText(trRules, fmtLoc)
          }

          return { reward: rewardObj, rules: rulesObj }
        }),
      )

      outTR.value = JSON.stringify(translatedDays, null, 2)
    } finally {
      isTranslating.value = false
    }
  }

  watch(
    site,
    () => {
      const available = translationButtons[site.value] || []
      if (!available.includes(selectedLang.value)) selectedLang.value = available[0] || 'de'
    },
    { immediate: true },
  )
</script>

<style scoped>
  .wrap {
    min-height: 100vh;
    background: #f6f7fb;
    padding: 20px;
  }
  .top {
    position: sticky;
    top: 0;
    background: #f6f7fb;
    padding-bottom: 14px;
    z-index: 5;
  }
  h1 {
    margin: 0 0 12px;
    font-size: 20px;
  }
  .row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  select {
    height: 38px;
    border: 1px solid #d7dbe7;
    border-radius: 10px;
    padding: 0 10px;
    background: #fff;
  }
  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .langbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-left: auto;
  }
  .chip {
    height: 34px;
    border-radius: 999px;
    border: 1px solid #d7dbe7;
    background: #fff;
    padding: 0 12px;
    cursor: pointer;
    font-weight: 700;
  }
  .chip.active {
    background: #111827;
    color: #fff;
    border-color: #111827;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 980px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  .card {
    background: #fff;
    border: 1px solid #e3e7f2;
    border-radius: 16px;
    padding: 14px;
  }
  .day {
    border: 1px solid #e3e7f2;
    border-radius: 14px;
    padding: 12px;
    margin-top: 12px;
  }
  .dayHdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .idx {
    font-weight: 800;
  }
  .ta {
    width: 100%;
    border: 1px solid #d7dbe7;
    border-radius: 12px;
    padding: 12px;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
  }
  .btn {
    height: 34px;
    border-radius: 10px;
    border: 1px solid #d7dbe7;
    background: #fff;
    padding: 0 12px;
    cursor: pointer;
  }
  .btn.primary {
    background: #111827;
    color: #fff;
    border-color: #111827;
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .outHdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  h2 {
    margin: 0;
    font-size: 16px;
  }
</style>
