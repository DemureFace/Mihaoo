export default {
  tournamentCard: (data) => `
{
      "type": "network",
      "params": {
        "name": "${data.name}",
        "pool": "${data.prizePool}",
        "bet": "${data.minBet} or currency equivalent",
        "timerText": "Time left before finish",
        "timer": "${data.endTimeISO}",
        "bgImageSrc": "${data.cardBgImageSrc}",
        "pool": ${data.poolObj},
        "link": "/tourn/${data.slug}"
      }
    },
  `,
  tournamentInner: (data) => `
<Components.Block
  templateName="cms-page"
  mod="tournament"
  typePage="tourn"
  containerMod="full"
  withoutContainer
  withoutVerticalSpace
>
  <Components.Block
    templateName="tourn-details-network"
    timer="${data.endTimeISO}"
    timerText="Time left before finish:"
    category="sweet_rush_bonanza"
    params={{
      name: '${data.slug}',
      bgImageSrc: '${data.bgImageSrcMob}',
      bgImageSrcDesk: '${data.bgImageSrc}',
      desc: 'Prize fund: ${data.prizePool}'
    }}
  >
    <Components.Block templateName="collapse-block" title="Terms & Conditions">
      <ul>
        <li>Provider: Boongo / Playson.</li>
        <li>This tournament starts on <strong>30.09.2025 at 10:01 UTC</strong> and ends on <strong>05.10.2025 at 23:59 UTC</strong>.</li>
        <li>The total prize pool is <Components.Snippet templateName="currencies-${data.prizeNumber}eur" />.</li>
        <li>Only real money bets will count.</li>
        <li>Qualifying Games: Game shown under Tournament Games.</li>
        <li>Minimum Bet is <Components.Snippet templateName="currencies-${data.minBetNumber}eur" /></li>
        ${data.rulesHtml}
        <p>
          <b>Restricted Countries:</b> ${data.restrictedCountriesList}
        </p>
        <li>You can receive updates about this tournament via email and SMS. Please enable a subscription in your profile.</li>
        <li>General Terms and Conditions apply.</li>
      </ul>
    </Components.Block>
  </Components.Block>
</Components.Block>
`,
promoCard: (data) => `
{
  "title": "${data.name}",
  "pool": "${data.prize}",
  "details": "<div>${data.cardDescription}</div>",
  "bonusCode": "${data.bonusCode}",
  "bg": "${data.cardBgImageSrc}",
  "bgMob": "${data.bgImageSrcMob}"
},`,

promoInner: (data) => `
${data.rulesHtml}
`
}
