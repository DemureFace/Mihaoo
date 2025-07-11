import { ref } from 'vue'
import { BRANDS } from '@/components/templates/brandsList'
import { BRAND_TEMPLATES } from '@/components/templates/brandTemplates'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
countries.registerLocale(enLocale)

function parseRestrictedCountries(text) {
  const match = text.match(/Restricted Countries:\s*(.+?)(?:\n|$)/i)
  if (!match) return ''

  const raw = match[1]

  const codes = raw
    .split(/[,;]+/)
    .map(c => c.replace(/\(.*?\)/g, '').trim()) // видаляє (regulated)
    .map(name => countries.getAlpha2Code(name, 'en'))
    .filter(Boolean)
    .map(code => `"${code.toLowerCase()}"`)

  return codes.join(', ')
}


export function useParser() {
  const input = ref('')
  const allBrandMarkup = ref({})

  // ---------------- HELPERS ----------------
  function extract(pattern, text, def = '') {
    const match = text.match(pattern)
    return match ? match[1].trim() : def
  }
  function extractTournamentRules(text) {
    const match = text.match(/TOURNAMENT RULES\s*\n([\s\S]+?)(?:\n\s*\n|$)/i)
    return match ? match[1].trim() : ''
  }
  function formatRulesAsList(rulesBlock) {
    return rulesBlock
      .split('\n')
      .filter(line => line.trim())
      .map(line => `<li>${line.replace(/^\s*[\p{Pd}\*•]+\s*/u, '')}</li>`)
      .join('\n')
  }
  function parseDate(str) {
    if (!str) return ''
    const [date, time, tz] = str.split(' ')
    if (!date || !time) return ''
    const [day, month, year] = date.split('.')
    return `${year}-${month}-${day}T${time}:00.000Z`
  }
  function parsePrizePool(poolStr) {
    if (!poolStr) return { amount: 0, currency: '' }
    const match = poolStr.match(/([\d\s,\.]+)\s*([A-Z]{3,})/i)
    if (!match) return { amount: 0, currency: '' }
    let amount = match[1].replace(/[\s,]/g, '')
    let currency = match[2]
    return { amount: Number(amount), currency }
  }
  function formatPrize(value, currency, geo) {
    switch (geo) {
      case 'au':
      case 'nz':
      case 'ca':
        return `$${(value * 1.5).toLocaleString('en-US')}`
      case 'en':
      case 'it':
        return `€${value.toLocaleString('en-US')}`
      case 'de':
        return `${value.toLocaleString('de-DE')} €`
      case 'ee':
        return `${value.toLocaleString('fr-FR').replace('.', ' ')} €`
      case 'no':
        return `${(value * 10).toLocaleString('en-US')} kr`
      case 'fr':
        return `${value.toLocaleString('en-US')}€`
      default:
        return `€${value.toLocaleString('en-US')}`
    }
  }

  // ---------------- PARSE MAIN ----------------
  function parse() {
    const text = input.value
    const restrictedCountries = parseRestrictedCountries(text)

    // ---- Парсиш як завжди:
    const startDate = extract(/Start date:\s*(.+?)(?:\n|$)/i, text)
    const endDate = extract(/End date:\s*(.+?)(?:\n|$)/i, text)
    const name = extract(/Name:\s*(.+?)(?:\n|$)/i, text)
    const cardBgImageSrc = extract(/Card Banner:\s*(.+?)(?:\n|$)/i, text)
    const description = extract(/Description:\s*(.+?)(?:\n|$)/i, text)
    const bgImageSrc = extract(/Banner:\s*(.+?)(?:\n|$)/i, text)
    const bgImageSrcMob = extract(/Banner Mobile:\s*(.+?)(?:\n|$)/i, text)
    const gameCategory = extract(/Game Categories id:\s*(.+?)(?:\n|$)/i, text)
    const prizePool = extract(/Prize pool:\s*(.+?)(?:\n|$)/i, text)
    const prizePoolMatch = prizePool ? prizePool.match(/[\d\s,\.]+/) : null
    const prizeNumber = prizePoolMatch ? prizePoolMatch[0].replace(/\s|,/g, '') : ''

    // --- Правила турніру
    const rulesBlock = extractTournamentRules(text)
    const rulesHtml = formatRulesAsList(rulesBlock)

    // --- Дати
    const startTimeISO = parseDate(startDate)
    const endTimeISO = parseDate(endDate)

    // --- pool (для різних гео)
    const { amount, currency } = parsePrizePool(prizePool)
    const poolObj = `{
      au: '${formatPrize(amount, currency, 'au')}',
      nz: '${formatPrize(amount, currency, 'nz')}',
      ca: '${formatPrize(amount, currency, 'ca')}',
      en: '${formatPrize(amount, currency, 'en')}',
      de: '${formatPrize(amount, currency, 'de')}',
      ee: '${formatPrize(amount, currency, 'ee')}',
      it: '${formatPrize(amount, currency, 'it')}',
      no: '${formatPrize(amount, currency, 'no')}',
      fr: '${formatPrize(amount, currency, 'fr')}',
      default: '${formatPrize(amount, currency, 'en')}'
    }`

    // --- Передаєш у шаблони всі дані:
    const data = {
      startDate,
      endDate,
      name,
      cardBgImageSrc,
      restrictedCountries,
      description,
      bgImageSrc,
      bgImageSrcMob,
      prizePool,
      prizeNumber,
      gameCategory,
      rulesHtml,
      startTimeISO,
      endTimeISO,
      poolObj,
    }

    // --- Генеруєш для всіх брендів:
    const result = {}

    for (const { key } of BRANDS) {
      const tpl = BRAND_TEMPLATES[key]
    console.log('brand', key, tpl)

      result[key] = {
        tournamentCard: tpl.tournamentCard(data),

        tournamentInner: tpl.tournamentInner(data),
      }
    }
    allBrandMarkup.value = result
  }

  return { input, allBrandMarkup, parse }
}
