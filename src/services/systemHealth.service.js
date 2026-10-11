export const CORE_SERVICES = [
  {
    key: 'gateway',
    label: 'Gateway',
  },
  {
    key: 'auth-service',
    label: 'Auth',
  },
  {
    key: 'bonus-service',
    label: 'Bonus',
  },
  {
    key: 'tournament-service',
    label: 'Tournament',
  },
  {
    key: 'analytics-service',
    label: 'Analytics',
  },
]

const HEALTH_ENDPOINT =
  '/.netlify/functions/backend-health'

const CHECK_TIMEOUT = 15_000

const WAKE_TIMEOUT = 180_000

const WAKE_INTERVAL = 5_000

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function createUnavailableHealth() {
  return {
    reachable: false,

    timestamp: new Date().toISOString(),

    services: Object.fromEntries(
      CORE_SERVICES.map(({ key }) => [
        key,
        'error',
      ]),
    ),
  }
}

function normalizeResponse(data) {
  const services = {}

  CORE_SERVICES.forEach(({ key }) => {
    services[key] =
      data?.services?.[key] === 'ok'
        ? 'ok'
        : 'error'
  })

  return {
    reachable: true,

    timestamp:
      data?.timestamp ||
      new Date().toISOString(),

    services,
  }
}

async function requestSystemHealth(
  method = 'GET',
) {
  const controller = new AbortController()

  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, CHECK_TIMEOUT)

  try {
    const response = await fetch(
      HEALTH_ENDPOINT,
      {
        method,

        headers: {
          Accept: 'application/json',
        },

        cache: 'no-store',

        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error(
        `Backend health request failed: ${response.status}`,
      )
    }

    const data = await response.json()

    return normalizeResponse(data)
  } catch {
    return createUnavailableHealth()
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function getSystemHealth() {
  return requestSystemHealth('GET')
}

export function areCoreServicesOnline(
  health,
) {
  return CORE_SERVICES.every(
    ({ key }) =>
      health?.services?.[key] === 'ok',
  )
}

export async function wakeSystem({
  onUpdate,

  timeout = WAKE_TIMEOUT,

  interval = WAKE_INTERVAL,
} = {}) {
  const startedAt = Date.now()

  /*
   * POST запускає server-side requests
   * з Netlify до Render.
   *
   * Якщо Render service sleeping,
   * цей request запускає cold start.
   */
  let health =
    await requestSystemHealth('POST')

  onUpdate?.(health)

  if (areCoreServicesOnline(health)) {
    return {
      success: true,
      health,
    }
  }

  /*
   * Після wake request продовжуємо
   * перевіряти статус раз на 5 секунд.
   */
  while (
    Date.now() - startedAt < timeout
  ) {
    await wait(interval)

    health = await getSystemHealth()

    onUpdate?.(health)

    if (areCoreServicesOnline(health)) {
      return {
        success: true,
        health,
      }
    }
  }

  return {
    success: false,
    health,
  }
}
