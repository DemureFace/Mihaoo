import { ref } from 'vue'
import { BRANDS } from '@/components/templates/brandsList'
import { BRAND_TEMPLATES } from '@/components/templates/brandTemplates'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
countries.registerLocale(enLocale)

const pad2 = (n) => String(n).padStart(2, '0')

function parseDateLoose(s) {
  if (!s) return null
  // 1) YYYY-MM-DD[ ...]
  const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m1) return new Date(+m1[1], +m1[2] - 1, +m1[3])
  // 2) DD.MM.YYYY[ ...]
  const m2 = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  if (m2) return new Date(+m2[3], +m2[2] - 1, +m2[1])
  // 3) fallback
  const d = new Date(s)
  return isNaN(d) ? null : d
}

function formatDdMm(d) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`
}

/** Повертає 'DD.MM-DD.MM'. Якщо `subtractEndDay=true`, відніме 1 день від кінця. */
function shortRange(startStr, endStr, subtractEndDay = true) {
  const s = parseDateLoose(startStr)
  const e0 = parseDateLoose(endStr)
  if (!s || !e0) return ''
  const e = new Date(e0)
  if (subtractEndDay) e.setDate(e.getDate() - 1)
  if (e < s) return formatDdMm(s)
  return `${formatDdMm(s)}-${formatDdMm(e)}`
}

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
  function toKebab(str) {
    return String(str || '')
      .normalize('NFKD')                 // розкладемо на базові символи
      .replace(/[\u0300-\u036f]/g, '')   // приберемо діакритику
      .replace(/[^a-zA-Z0-9]+/g, '-')    // усе, що не літера/цифра → "-"
      .replace(/^-+|-+$/g, '')           // зріжемо дефіси з країв
      .toLowerCase()
  }

  // ---------------- PARSE MAIN ----------------
  function parse(activeTab) {
    const text = input.value
    const restrictedCountries = parseRestrictedCountries(text)

    // ---- Парсиш як завжди:
    const startDate = extract(/Start date:\s*(.+?)(?:\n|$)/i, text)
    const endDate = extract(/End date:\s*(.+?)(?:\n|$)/i, text)
    const promoStartDate = extract(/Start date:\s*(.+?)(?:\n|$)/i, text)
    const promoEndDate = extract(/End date:\s*(.+?)(?:\n|$)/i, text)
    const promoRangeShort = shortRange(promoStartDate, promoEndDate)
    const name = extract(/Name:\s*(.+?)(?:\n|$)/i, text)
    const promoTitle = extract(/Title:\s*(.+?)(?:\n|$)/i, text)
    const prize = extract(/Prize:\s*(.+?)(?:\n|$)/i, text)
    const cardBgImageSrc = extract(/Card Banner:\s*(.+?)(?:\n|$)/i, text)
    const cardDescription = extract(/Card Banner:\s*(.+?)(?:\n|$)/i, text)
    const description = extract(/Description:\s*(.+?)(?:\n|$)/i, text)
    const underDescription = extract(/Under Description:\s*(.+?)(?:\n|$)/i, text)
    const bgImageSrc = extract(/Banner:\s*(.+?)(?:\n|$)/i, text)
    const bgImageSrcMob = extract(/Banner Mobile:\s*(.+?)(?:\n|$)/i, text)
    const bonusCode = extract(/Bonus Code:\s*(.+?)(?:\n|$)/i, text)
    const prizePool = extract(/Prize pool:\s*(.+?)(?:\n|$)/i, text)
    const prizePoolMatch = prizePool ? prizePool.match(/[\d\s,\.]+/) : null
    const prizeNumber = prizePoolMatch ? prizePoolMatch[0].replace(/\s|,/g, '') : ''
    const minBet = extract(/Min(?:imum)?\s*bet:\s*(.+?)(?:\n|$)/i, text)
    const minBetMatch = minBet ? minBet.match(/[\d\s,\.]+/) : null
    const minBetNumber = minBetMatch ? minBetMatch[0].replace(/\s|,/g, '') : ''
    const restrictedCountriesList = extract(/Restricted Countries:\s*(.+?)(?:\n|$)/i, text)
    const gamesProvider = extract(/Games Provider:\s*(.+?)(?:\n|$)/i, text)

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

    const { amount: minAmount, currency: minCurrency } = parsePrizePool(minBet)
const minBetObj = `{
  au: '${formatPrize(minAmount, minCurrency, 'au')}',
  nz: '${formatPrize(minAmount, minCurrency, 'nz')}',
  ca: '${formatPrize(minAmount, minCurrency, 'ca')}',
  en: '${formatPrize(minAmount, minCurrency, 'en')}',
  de: '${formatPrize(minAmount, minCurrency, 'de')}',
  ee: '${formatPrize(minAmount, minCurrency, 'ee')}',
  it: '${formatPrize(minAmount, minCurrency, 'it')}',
  no: '${formatPrize(minAmount, minCurrency, 'no')}',
  fr: '${formatPrize(minAmount, minCurrency, 'fr')}',
  default: '${formatPrize(minAmount, minCurrency, 'en')}'
}`

    const slug = toKebab(name)

    // --- Передаєш у шаблони всі дані:
    const data = {
      startDate,
      endDate,
      promoStartDate,
      promoEndDate,
      promoRangeShort,
      name,
      promoTitle,
      prize,
      cardBgImageSrc,
      cardDescription,
      restrictedCountries,
      restrictedCountriesList,
      description,
      underDescription,
      bgImageSrc,
      bgImageSrcMob,
      prizePool,
      prizeNumber,
      poolObj,
      minBet,
      minBetNumber,
      minBetObj,
      slug,
      bonusCode,
      rulesHtml,
      startTimeISO,
      endTimeISO,
      gamesProvider
    }

    // --- Генеруєш для всіх брендів:
    const result = {}
    for (const { key } of BRANDS) {
      const tpl = BRAND_TEMPLATES[key] || {}

      if (activeTab === 'tournaments') {
        // віддаємо турнірні ключі
        result[key] = {
          tournamentCard:
            typeof tpl.tournamentCard === 'function' ? tpl.tournamentCard(data) : '',
          tournamentInner:
            typeof tpl.tournamentInner === 'function' ? tpl.tournamentInner(data) : '',
        }
      } else if (activeTab === 'promo') {
        // віддаємо промо-ключі; якщо немає — фолбек на турнірні
        result[key] = {
          promoCard:
            typeof tpl.promoCard === 'function' ? tpl.promoCard(data)
            : (typeof tpl.tournamentCard === 'function' ? tpl.tournamentCard(data) : ''),
          promoInner:
            typeof tpl.promoInner === 'function' ? tpl.promoInner(data)
            : (typeof tpl.tournamentInner === 'function' ? tpl.tournamentInner(data) : ''),
        }
      } else {
        // дефолт на випадок іншого значення таби
        result[key] = {
          tournamentCard:
            typeof tpl.tournamentCard === 'function' ? tpl.tournamentCard(data) : '',
          tournamentInner:
            typeof tpl.tournamentInner === 'function' ? tpl.tournamentInner(data) : '',
        }
      }
    }

    allBrandMarkup.value = result
  }

  return { input, allBrandMarkup, parse }
}
