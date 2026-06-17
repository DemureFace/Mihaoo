export default {
  tournamentCard: (data) => `
{
  "type": "network",
  "params": {
    "name": "${data.name}",
    "startDate": "${data.startTimeISO}",
    "finishDate": "${data.endTimeISO}",
    "bgImageSrc": "${data.cardBgImageSrc}",
    "pool": "${data.prizePool}",
    "link": "/tournaments/${data.slug}"
  }
},
`,
  tournamentInner: (data) => `
<Components.Block
  templateName="cms-page"
  mod="tournament"
  typePage="tourn"
  containerMod="full"
>
  <Components.Block
    templateName="tourn-network"
    name="${data.name}"
    startDate="${data.startTimeISO}"
    finishDate="${data.endTimeISO}"
    bgImageSrc="${data.bgImageSrc}"
    pool="${data.prizePool}"
    collection="${data.slug}"
  >
    <Components.Block
      templateName="collapse-block"
      className="collapse-block--with-separator"
      title="Terms & Conditions"
    >
      <p>
        <strong>Tournament Duration:</strong> ${data.startDate} – ${data.endDate}<br />
        <strong>Total Prize Pool:</strong> <Components.Snippet templateName="currencies-${data.prizeNumber}eur" /><br /><br />
        <strong>Tournament Rules:</strong>
        <ul>
          <li>Provider: ${data.gamesProvider}</li>
          <li>Only real money bets will count</li>
          <li>Qualifying Games: Games shown under “Tournament Games”</li>
          ${data.rulesHtml}
          <li>Cash prizes will be credited as withdrawable funds within 72 hours after the promotion ends</li>
          <li>You can receive updates via email and SMS — please enable notifications in your profile</li>
          <li>General Terms and Conditions apply</li>
        </ul>

        <strong>Restricted Countries:</strong>
        <p>
          ${data.restrictedCountriesList}
        </p>
      </p>
    </Components.Block>
  </Components.Block>
</Components.Block>
`,

promoCard: (data) => `
{
  "title":"${data.name}",
  "prize": "${data.prize}",
  "description": "${data.cardDescription}",
  "imgURL":"${data.cardBgImageSrc}",
  "bonusCode":"${data.bonusCode}",
  "buttonTitle": "Get Bonus",
  "link": {
    "title": "Bonus Terms & Conditions",
    "url": "bonus-terms-and-conditions",
    "isModal": true
  },
  "allowedForGroups":[
    ""
  ],
  "disallowedForGroups":[
    ""
  ],
  "type": "medium"
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
