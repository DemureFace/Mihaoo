export default {
  tournamentCard: (data) => `
{
      "type": "network",
      "params": {
        "name": "${data.name}",
        "startDate": "${data.startTimeISO}",
        "finishDate": "${data.endTimeISO}",
        "bgImageSrc": "${data.cardBgImageSrc}",
        "pool": ${data.poolObj},
        "link": "/tournaments/${data.gameCategory}"
      }
    },
  `,
  tournamentInner: (data) => `
<Components.Block templateName="cms-page" mod="tournament" typePage="tourn" containerMod="full">
  <Components.Block
    templateName="tourn-network"
    name="${data.name}"
    startDate="${data.startTimeISO}"
    finishDate="${data.endTimeISO}"
    bgImageSrc="bgImageSrc"
    pool=${data.poolObj}
    collection="${data.gameCategory}"
  >


    <Components.Block
      templateName="collapse-block"
      className="collapse-block--with-separator"
      title="Terms & Conditions"
    >
      <p>
        <strong>General Terms:</strong>
        <ul>
          <li>Only real money bets qualify</li>
          <li>Total prize pool: <Components.Snippet templateName="currencies-${data.prizeNumber}eur" /></li>
          <li>Daily prize pool: <Components.Snippet templateName="currencies-${data.prizeNumber}eur" /></li>
          ${data.rulesHtml}
          <li>Prizes will be credited as withdrawable funds within 72 hours after the tournament ends</li>
          <li>To receive updates via email/SMS, activate notifications in your profile</li>
          <li>Restricted countries: All countries <b>except</b> Australia, France, Greece (regulated), Sweden (regulated), Romania (regulated), Denmark (regulated), Peru (regulated), Brazil (regulated)</li>
          <li>General Terms and Conditions apply</li>
        </ul>
      </p>
    </Components.Block>

  </Components.Block>
</Components.Block>

`,

}
