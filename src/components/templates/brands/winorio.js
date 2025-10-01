export default {
  tournamentCard: (data) => `
{
  "endTime": "${data.endTimeISO}",
  "startTime": "${data.startTimeISO}",
  "params": {
    "notShowForGeoIps": [
      ${data.restrictedCountries}
    ],
    "name": "${data.name}",
    "description": "${data.cardDescription}",
    "ipPool": ${data.poolObj},
    "link": "tournaments/${data.gameCategory}",
    "bgImageSrc": "${data.cardBgImageSrc}"
  },
  "category": "network"
},
`,
  tournamentInner: (data) => `
  <Components.Block
  templateName={'cms-page'}
  mod={'tournament'}
  typePage={'tourn'}
  containerMod={'full'}
>
  <Components.Block
    templateName="tourn-network"
    startTime="${data.startTimeISO}"
    endTime="${data.endTimeISO}"
    category="${data.gameCategory}"
    params={{
      name: {default: "${data.name}"},
      showPrizes: false,
      bgImageSrc: '${data.bgImageSrc}',
      bgImageSrcMob: '${data.bgImageSrcMob}',
      pool: ${data.poolObj},
      gameBtn: {default: "Show Games"}
    }}
  >
    <Components.Block
      templateName="collapse-block"
      title={'TOURNAMENT RULES'}
    >
      <ul>
        <li>This tournament starts on ${data.startDate} to ${data.endDate}.
        </li>
        <li>The total prize pool is <Components.Snippet templateName="currencies-${data.prizeNumber}eur" />.</li>
        <li>Only real money bets will count.</li>
        ${data.rulesHtml}
        <li>Cash prizes will be credited as withdrawable funds within 72 hours after the promotion ends.</li>
        <li>You can receive updates about this tournament via email and SMS. Please enable a subscription in your profile.</li>
        <li><a href="/terms-and-conditions">General Terms and Conditions</a> apply.</li>
      </ul>
    </Components.Block>
  </Components.Block>
</Components.Block>`,

promoCard: (data) => `
{
  "title":"${data.name}",
  "promotionLink":"/promotions/${data.slug}",
  "bonusCode":"${data.bonusCode}",
  "imgURL":"${data.cardBgImageSrc}",
	"snippetPrizeName":"${data.slug}",
  "allowedForGroups":[
    "all_except_vip"
  ],
  "disallowedForGroups":[
    "all_vip",
    "ba"
  ],
  "dateRange":{
    "start":"${data.promoStartDate}",
    "end":"${data.promoEndDate}"
  },
  "condition":"Runs ${data.promoRangeShort}"
},
`,

promoInner: (data) => `
<Components.Block
  templateName={'cms-page'}
  mod={'promotion'}
  typePage={'promotion'}
  containerMod={'small'}
>
  <Components.Block
    templateName="promotion-page"
    title="${data.promoTitle}"
    imgUrl="${data.bgImageSrc}"
  >
    ${data.description}
    <Components.Block templateName="bonus-code-field" code={"${data.bonusCode}"}>
  </Components.Block>
    ${data.underDescription}
  <Components.Block
    templateName={'collapse-block'}
    title={'Bonus Rules'}
    className="promotion-page__collapse"
  >
    <ol className="styled-list">
      ${data.rulesHtml}
    </ol>
  </Components.Block>
  </Components.Block>
</Components.Block>`,
}
