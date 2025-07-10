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
"description": "${data.description}",
"ipPool": ${data.poolObj},
"link": "tournaments/${data.gameCategory}",
"bgImageSrc": "${data.cardBgImageSrc}"
},
"category": "network"
},
`,
  tournamentInner: (data) => `


<Components.Block
templateName="tourn-network"
    startTime="${data.startTimeISO}"
    endTime="${data.endTimeISO}"
category="${data.gameCategory}"
params={{
   name: {default: "${data.name}"},
   showPrizes: true,
   bgImageSrc: '${data.bgImageSrc}',
bgImageSrcMob: "/cms/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBM1JjQ2c9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--12c653ca7fd9d448cecfc010be29dcee6b732106/SR-page-mob-Endorphina-BDay.webp",
   pool: ${data.poolObj},
         placesCount: {default: 300},

            minBet: {
         au: '$0.45',
         nz: '$0.45',
         ca: '$0.45',
         en: '€0.3',
         de: '0,3 €',
         it: '€0.3',
         no: '3 kr',
         fr: '0.3€',
         default: '€0.3'
      },
            textSection: {default:"${data.description}"}
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
        {props.common.player?.isSignedIn ? (
          <li>You can receive updates about this tournament via email and SMS. Please
            <a href="/profile/general/info">
              enable a subscription in your profile
            </a>.
          </li>
        ) : (
          <li>You can receive updates about this tournament via email and SMS. Please enable a subscription in your profile.</li>
        )}
          <li>
            <a href="/terms-and-conditions">
              General Terms and Conditions
            </a> apply.
          </li>
      </ul>
</Components.Block>
</Components.Block>
`,

}
