<template>
  <div class="wrap">
    <header class="top">
      <h1>Currency Converter</h1>

      <div class="row">
        <label class="field">
          <span>Site</span>
          <select v-model="site">
            <option v-for="s in sites" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>

        <div class="tabs">
          <button class="tab" :class="{ active: tab === 'content' }" @click="tab = 'content'">
            Content
          </button>
          <button class="tab" :class="{ active: tab === 'data' }" @click="tab = 'data'">
            Data
          </button>
          <button class="tab" :class="{ active: tab === 'snippet' }" @click="tab = 'snippet'">
            Snippet
          </button>
        </div>

        <button class="btn" @click="convert">Convert</button>
      </div>
    </header>

    <main class="grid">
      <section class="card">
        <div class="cardHdr">
          <h2>Input</h2>
          <button class="btn" @click="input = ''">Clear</button>
        </div>

        <textarea
          v-model="input"
          class="ta"
          rows="14"
          placeholder="Paste text with currencies (€, EUR, $, kr, £, etc.)"
        />
        <p class="hint">
          Заміна йде тільки для валютних патернів (символ/код + число), як у твоєму
          процесорі:contentReference[oaicite:3]{index=3}.
        </p>
      </section>

      <section class="card">
        <div class="cardHdr">
          <h2>Output</h2>
          <button class="btn" :disabled="!output.trim()" @click="copy(output)">Copy</button>
        </div>

        <textarea class="ta" rows="14" readonly :value="output" />
        <p class="hint">
          Site locales:
          <b>{{ (siteModes[site] || []).join(', ') }}</b>
        </p>
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

  /* ---------- data (from your file) ---------- */
  const siteModes = {
    Winorio: ['nz', 'pt', 'fr', 'gb', 'gr', 'de', 'default'],
    Spinrise: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    JeetCity: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    Moonwin: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    SlotsGallery: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
    BohoCasino: ['au', 'nz', 'ca', 'de', 'at', 'ch', 'fr', 'it', 'no', 'default'],
  }

  // Map chosen target button to default currency formatting locale (kept for parity)
  const defaultFormatLocaleByTarget = {
    de: 'de',
    'en-au': 'au',
    et: 'et',
    fi: 'fi',
    fr: 'fr',
    it: 'it',
    no: 'no',
    el: 'gr',
    pt: 'pt',
  }

  // Currency rules from your converter:contentReference[oaicite:4]{index=4}
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

  /* ---------- core helpers (improved but same logic) ---------- */
  function formatNumber(val, locale) {
    const r = conversionRules[locale] || conversionRules.en
    const isNo = locale === 'no' // your convertAmount rounds for 'no':contentReference[oaicite:5]{index=5}
    const n = isNo ? Math.round(val) : val

    // format: thousands + decimal using rule
    const fixed = locale === 'no' ? String(n) : Number(n).toFixed(2)
    const [intRaw, fracRaw = '00'] = fixed.split('.')
    const sign = intRaw.startsWith('-') ? '-' : ''
    const int = intRaw.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, r.separator)
    return locale === 'no' ? sign + int : sign + int + r.decimal + fracRaw
  }

  function convertAmount(val, locale) {
    const r = conversionRules[locale] || conversionRules.en
    return val * r.rate // same as your converter:contentReference[oaicite:6]{index=6}
  }

  function placeCurrency(formatted, locale) {
    const r = conversionRules[locale] || conversionRules.en
    if (r.position === 'before') return r.symbol + formatted
    if (localesWithSpaceAfter.includes(locale) || r.spaceBefore) return formatted + ' ' + r.symbol
    return formatted + r.symbol
  }

  function parseNumberLoose(amountStr) {
    // very close to your approach: last separator near end becomes decimal; others removed:contentReference[oaicite:7]{index=7}
    const s = String(amountStr || '').replace(/\s+/g, '')
    const ld = s.lastIndexOf('.'),
      lc = s.lastIndexOf(',')
    const li = Math.max(ld, lc)

    let normalized
    if (li >= 0 && s.length - li <= 3) {
      normalized = parseFloat(s.replace(/[.,]/g, (ch, idx) => (idx === li ? '.' : '')))
    } else {
      normalized = parseFloat(s.replace(/[.,]/g, ''))
    }
    return Number.isFinite(normalized) ? normalized : null
  }

  /**
   * Main currency conversion for text:
   * pattern is taken from your tool (symbol-before OR number-before + codes):contentReference[oaicite:8]{index=8}
   */
  function processText(text, locale) {
    const pattern =
      /([€$£])\s?(\d[\d.,\s]*)|(\d[\d.,\s]*)\s*(€|\$|£|kr|eur|usd|cad|aud|nzd|nok|chf|gbp)/gi
    const out = String(text || '').replace(pattern, (m, sb, v1, v2, sa) => {
      const amountStr = sb ? v1 : v2
      if (!amountStr || !/\d/.test(amountStr)) return m

      const normalized = parseNumberLoose(amountStr)
      if (normalized == null) return m

      const conv = convertAmount(normalized, locale)
      const formatted = formatNumber(conv, locale)

      return placeCurrency(formatted, locale)
    })

    // spacing fix before letters (same intent as your tool):contentReference[oaicite:9]{index=9}
    let spaced = out
      .replace(/([€$£]\s?\d[\d.,]*)(?=\p{L})/gu, '$1 ')
      .replace(/(\d[\d.,]*\s?(?:€|\$|£|kr))(?=\p{L})/gu, '$1 ')

    // AU pokies transform:contentReference[oaicite:10]{index=10}
    if (locale === 'au') {
      spaced = spaced
        .replace(/(^|[^A-Za-z])slots(?=([^A-Za-z]|$))/gi, (m, p) => p + 'pokies')
        .replace(/(^|[^A-Za-z])slot(?=([^A-Za-z]|$))/gi, (m, p) => p + 'pokie')
    }
    return spaced
  }

  /* Snippet mode: convert € / EUR amounts to Components.Snippet template */
  function eurSnippet(intPart, fracPart) {
    if (!intPart && !fracPart) return ''
    if (fracPart) {
      if (intPart === '0' || !intPart)
        return `<Components.Snippet templateName="currencies-0${fracPart}eur" />`
      return `<Components.Snippet templateName="currencies-${intPart}${fracPart}eur" />`
    }
    return `<Components.Snippet templateName="currencies-${intPart}eur" />`
  }

  function processTextForSnippets(text) {
    const NUM_TOKEN = '[0-9]{1,3}(?:[ \\t\\u00A0\\.,]*[0-9]{3})*(?:[\\.,][0-9]{1,3})?'
    const CURRENCY_TOKEN = '(?:€|EUR)'
    const PATTERN = new RegExp(
      `(?:(${CURRENCY_TOKEN})[ \\t\\u00A0]*(${NUM_TOKEN})|(${NUM_TOKEN})[ \\t\\u00A0]*(${CURRENCY_TOKEN}))`,
      'gi',
    )

    return String(text || '').replace(PATTERN, (match, c1, n1, n2, c2) => {
      const rawNum = n1 || n2
      if (!rawNum) return match

      let trailing = ''
      let core = rawNum
      if (/[.,!?]$/.test(rawNum)) {
        trailing = rawNum.slice(-1)
        core = rawNum.slice(0, -1)
      }

      // split int/frac (same behavior idea as override in your file)
      let int = core.replace(/[,.\s]/g, '')
      let frac = ''
      if (core.includes(',') && !core.includes('.')) {
        const parts = core.split(',')
        if (parts.length === 2) {
          int = parts[0].replace(/\./g, '')
          frac = parts[1]
        }
      } else if (core.includes('.') && !core.includes(',')) {
        const parts = core.split('.')
        if (parts.length === 2 && parts[1].length <= 2) {
          int = parts[0]
          frac = parts[1]
        }
      }

      const sn = eurSnippet(int, frac)
      return sn ? sn + trailing : match
    })
  }

  /* ---------- UI state ---------- */
  const sites = computed(() => Object.keys(siteModes))
  const site = useLocalStorageRef('cc.site', 'Moonwin')
  const tab = useLocalStorageRef('cc.tab', 'content')

  const input = useLocalStorageRef('cc.input', '')
  const output = ref('')

  function convert() {
    const locales = siteModes[site.value] || ['default']

    const map = {}
    for (const loc of locales) {
      const fmtLoc = loc === 'default' ? 'en' : loc

      let converted
      if (tab.value === 'snippet') {
        converted = processTextForSnippets(String(input.value || ''))
        map[loc] = `<span>${converted}</span>`
      } else {
        converted = processText(String(input.value || ''), fmtLoc)
        map[loc] = converted
      }
    }

    // Output formatting: keep same “map-like” view (readable for copy)
    output.value = Object.entries(map)
      .map(([k, v]) => (tab.value === 'snippet' ? `${k}: "${v}"` : `"${k}": "${v}"`))
      .join(',\n')
  }
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
    align-items: end;
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
  .tabs {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
  .tab {
    height: 38px;
    border-radius: 10px;
    border: 1px solid #d7dbe7;
    background: #fff;
    padding: 0 12px;
    cursor: pointer;
  }
  .tab.active {
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
  .cardHdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  h2 {
    margin: 0;
    font-size: 16px;
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
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .hint {
    margin: 10px 0 0;
    color: #6b7280;
    font-size: 12px;
  }
</style>
