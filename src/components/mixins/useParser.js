import { ref } from 'vue'

export function useParser() {

const input = ref('')
const cmsCodeTournCard = ref('')
const cmsCodePromoCard = ref('')
const cmsCodeInnerPage = ref('')
const cmsCodeSr = ref('')

function extract(pattern, text, def = '') {
  const match = text.match(pattern)
  return match ? match[1].trim() : def
}

// --- Витягуємо TOURNAMENT RULES
function extractTournamentRules(text) {
  const match = text.match(/TOURNAMENT RULES\s*\n([\s\S]+?)(?:\n\s*\n|$)/i)
  return match ? match[1].trim() : ''
}
function formatRulesAsList(rulesBlock) {
  return rulesBlock
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<li>${line.replace(/^[-•\*]\s*/, '')}</li>`)
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

function parse() {
  const text = input.value
  // Основні поля
  const startDate = extract(/Start date:\s*(.+?)(?:\n|$)/i, text)
  const endDate = extract(/End date:\s*(.+?)(?:\n|$)/i, text)
  const name = extract(/Name:\s*(.+?)(?:\n|$)/i, text)
  const bgImageSrc = extract(/Banner:\s*(.+?)(?:\n|$)/i, text)
  const bgImageSrcMob = extract(/Banner Mobile:\s*(.+?)(?:\n|$)/i, text)
  const prizePool = extract(/Prize pool:\s*(.+?)(?:\n|$)/i, text)
  const gameCategory = extract(/Game Categories id:\s*(.+?)(?:\n|$)/i, text)
  const prizeNumber = prizePool.match(/[\d\s,\.]+/)[0].replace(/\s|,/g, '')

  // Правила
  const rulesBlock = extractTournamentRules(text)
  const rulesHtml = formatRulesAsList(rulesBlock)

  // Дата у форматі ISO для CMS
  const startTimeISO = parseDate(startDate)
  const endTimeISO = parseDate(endDate)

  // pool
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

  cmsCodePromoCard.value = `
    "title":"Path to Prestige",
"promotionLink":"/promotions/path-to-prestige",
"bonusCode":"TAKE",
"imgURL":"/cms/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeGhPQ2c9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--b40a58f10fed1e1ba631bb7f919b74d38221ba5a/Pre-VIP-Bonus_slider.webp",
"allowedForGroups":[
"allowed_for_pre_vip"
],
"disallowedForGroups":[
"forbidden_for_pre_vip",
"ba"
],
"prize":"Get 30% up to<br/>€500 + 20 FS",
"signInOnly":true,
"category":"reload"
  `

  cmsCodeInnerPage.value = `
<Components.Block
  templateName={'cms-page'}
  mod={'tournament'}
  typePage={'tourn'}
  containerMod={'full'}
>
  <Components.Block
    templateName="tourn-network"
    startTime="${startTimeISO}"
    endTime="${endTimeISO}"
    category="${gameCategory}"
    params={{
      name: {default: "${name}"},
      showPrizes: false,
      bgImageSrc: '${bgImageSrc}',
      bgImageSrcMob: "${bgImageSrcMob}",
      pool: ${poolObj},
      gameBtn: {default: "Show Games"}
    }}
  >
    <Components.Block
      templateName="collapse-block"
      title={'TOURNAMENT RULES'}
    >
      <ul>
        <li>This tournament starts on ${startDate} to ${endDate}.<br/>
            HAPPY HOURS will run every tournament day from:<br/>
            10:00 to 12:00 and 18:00 to 20:00 (UTC)
        </li>
        <li>The total prize pool is <Components.Snippet templateName="currencies-${prizeNumber}eur" />.</li>
        <li>Only real money bets will count.</li>
        ${rulesHtml}
        <li>Cash prizes will be credited as withdrawable funds within 72 hours after the promotion ends.</li>
        <li>You can receive updates about this tournament via email and SMS. Please enable a subscription in your profile.</li>
        <li><a href="/terms-and-conditions">General Terms and Conditions</a> apply.</li>
      </ul>
    </Components.Block>
  </Components.Block>
</Components.Block>`

cmsCodeSr.value = `

  <Components.Block
    templateName="tourn-network"
    startTime="${startTimeISO}"
    endTime="${endTimeISO}"
    category="${gameCategory}"
    params={{
      name: {default: "${name}"},
      showPrizes: false,
      bgImageSrc: '${bgImageSrc}',
      bgImageSrcMob: "${bgImageSrcMob}",
      pool: ${poolObj},
      gameBtn: {default: "Show Games"}
    }}
  >
    <Components.Block
      templateName="collapse-block"
      title={'TOURNAMENT RULES'}
    >
      <ul>
        <li>This tournament starts on ${startDate} to ${endDate}.<br/>
            HAPPY HOURS will run every tournament day from:<br/>
            10:00 to 12:00 and 18:00 to 20:00 (UTC)
        </li>
        <li>The total prize pool is <Components.Snippet templateName="currencies-${prizeNumber}eur" />.</li>
        <li>Only real money bets will count.</li>
        ${rulesHtml}
        <li>Cash prizes will be credited as withdrawable funds within 72 hours after the promotion ends.</li>
        <li>You can receive updates about this tournament via email and SMS. Please enable a subscription in your profile.</li>
        <li><a href="/terms-and-conditions">General Terms and Conditions</a> apply.</li>
      </ul>
    </Components.Block>
</Components.Block>`
}
return { input, cmsCodeInnerPage, cmsCodeSr, parse };
}
