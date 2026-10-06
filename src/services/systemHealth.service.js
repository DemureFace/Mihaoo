import api from './api'

export const CORE_SERVICES = [
  {
    key: 'gateway',
    label: 'Gateway',
    wakeUrl: 'https://mihaoo-gateway.onrender.com/health',
  },
  {
    key: 'auth-service',
    label: 'Auth',
    wakeUrl: 'https://mihaoo-auth.onrender.com/health',
  },
  {
    key: 'bonus-service',
    label: 'Bonus',
    wakeUrl: 'https://mihaoo-bonus.onrender.com/health',
  },
  {
    key: 'tournament-service',
    label: 'Tournament',
    wakeUrl: 'https://mihaoo-tournament.onrender.com/health',
  },
  {
    key: 'analytics-service',
    label: 'Analytics',
    wakeUrl: 'https://mihaoo-analytics.onrender.com/health',
  },
]

const CHECK_TIMEOUT = 60_000
const WAKE_TIMEOUT = 180_000
const WAKE_INTERVAL = 5_000
const DIRECT_WAKE_INTERVAL = 15_000

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
    ({ key }) =>
      health?.services?.[key] === 'ok',
  )
}

function knockService(service) {
  if (!service.wakeUrl) {
    return
  }

  // no-cors важливий:
  // нам не потрібен response body.
  // Нам потрібно лише доставити GET до Render,
  // щоб запустити cold start.
  void fetch(service.wakeUrl, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-store',
  }).catch(() => {
    // Status перевіряємо через Gateway.
    // Помилка direct request тут не є
    // остаточним health result.
  })
}

export function knockAllServices() {
  CORE_SERVICES.forEach(knockService)
}

export async function wakeSystem({
  onUpdate,
  timeout = WAKE_TIMEOUT,
  interval = WAKE_INTERVAL,
} = {}) {
  const startedAt = Date.now()

  let lastDirectWakeAt = 0
  let health = null

  while (Date.now() - startedAt < timeout) {
    const now = Date.now()

    // Напряму будимо Render services.
    if (
      now - lastDirectWakeAt >=
      DIRECT_WAKE_INTERVAL
    ) {
      knockAllServices()

      lastDirectWakeAt = now
    }

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
