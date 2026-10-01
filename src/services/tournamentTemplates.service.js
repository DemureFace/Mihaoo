import api from './api'

export const tournamentTemplatesService = {
  async generateNetwork(
    payload,
    signal,
  ) {
    const { data } = await api.post(
      '/tournament-templates/generate',
      payload,
      {
        signal,
      },
    )

    return data
  },

  async generateNetworkSnippets(
    payload,
    signal,
  ) {
    const { data } = await api.post(
      '/tournament-templates/generate/snippet',
      payload,
      {
        signal,
      },
    )

    return data
  },

  async generateNetworkLocales(
    payload,
    signal,
  ) {
    const { data } = await api.post(
      '/tournament-templates/generate/locales',
      payload,
      {
        signal,
      },
    )

    return data
  },

  async generateOrdinary(
    payload,
    signal,
  ) {
    const { data } = await api.post(
      '/tournament-templates/generate/ordinary',
      payload,
      {
        signal,
      },
    )

    return data
  },
}
