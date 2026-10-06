import api from './api'

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

const CHECK_TIMEOUT = 60_000
const WAKE_TIMEOUT = 120_000
const WAKE_INTERVAL = 5_000

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function normalizeResponse(response) {
  return {
    reachable: true,

    timestamp:
      response.data?.timestamp ||
      new Date().toISOString(),

    services: response.data?.services || {
      gateway: 'ok',
    },
  }
}

export async function getSystemHealth() {
  try {
    const response = await api.get('/health/system', {
      timeout: CHECK_TIMEOUT,

      // Gateway повертає 503, якщо хоча б один
      // downstream service недоступний.
      // Для health UI це валідна відповідь,
      // а не transport error.
      validateStatus: (status) =>
        status === 200 || status === 503,
    })

    return normalizeResponse(response)
  } catch {
    return {
      reachable: false,

      timestamp: new Date().toISOString(),

      services: {
        gateway: 'error',
      },
    }
  }
}

export function areCoreServicesOnline(health) {
  return CORE_SERVICES.every(
    ({ key }) => health?.services?.[key] === 'ok',
  )
}

export async function wakeSystem({
  onUpdate,
  timeout = WAKE_TIMEOUT,
  interval = WAKE_INTERVAL,
} = {}) {
  const startedAt = Date.now()

  let health = null

  while (Date.now() - startedAt < timeout) {
    health = await getSystemHealth()

    onUpdate?.(health)

    if (areCoreServicesOnline(health)) {
      return {
        success: true,
        health,
      }
    }

    await wait(interval)
  }

  return {
    success: false,
    health,
  }
}
