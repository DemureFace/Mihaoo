const REQUEST_TIMEOUT_MS = 8_000

const SERVICES = [
  {
    key: 'gateway',
    url:
      process.env.MIHAOO_GATEWAY_HEALTH_URL ||
      'https://mihaoo-gateway.onrender.com/health',
  },
  {
    key: 'auth-service',
    url:
      process.env.MIHAOO_AUTH_HEALTH_URL ||
      'https://mihaoo-auth.onrender.com/health',
  },
  {
    key: 'bonus-service',
    url:
      process.env.MIHAOO_BONUS_HEALTH_URL ||
      'https://mihaoo-bonus.onrender.com/health',
  },
  {
    key: 'tournament-service',
    url:
      process.env.MIHAOO_TOURNAMENT_HEALTH_URL ||
      'https://mihaoo-tournament.onrender.com/health',
  },
  {
    key: 'analytics-service',
    url:
      process.env.MIHAOO_ANALYTICS_HEALTH_URL ||
      'https://mihaoo-analytics.onrender.com/health',
  },
]

function createJsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,

    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...extraHeaders,
    },
  })
}

async function checkService(service) {
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(service.url, {
      method: 'GET',

      headers: {
        Accept: 'application/json',
      },

      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        key: service.key,
        status: 'error',
      }
    }

    let body = null

    try {
      body = await response.json()
    } catch {
      return {
        key: service.key,
        status: 'error',
      }
    }

    if (body?.status !== 'ok') {
      return {
        key: service.key,
        status: 'error',
      }
    }

    return {
      key: service.key,
      status: 'ok',
    }
  } catch {
    return {
      key: service.key,
      status: 'error',
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

async function checkAllServices() {
  const results = await Promise.all(
    SERVICES.map((service) => checkService(service)),
  )

  const services = Object.fromEntries(
    results.map(({ key, status }) => [key, status]),
  )

  const online = results.filter(
    ({ status }) => status === 'ok',
  ).length

  return {
    timestamp: new Date().toISOString(),
    services,
    online,
    total: SERVICES.length,
  }
}

export default async (request) => {
  const method = request.method.toUpperCase()

  if (!['GET', 'POST'].includes(method)) {
    return createJsonResponse(
      {
        error: 'Method not allowed',
      },
      405,
      {
        Allow: 'GET, POST',
      },
    )
  }

  /*
   * GET:
   *   одноразово перевіряє статус усіх сервісів.
   *
   * POST:
   *   робить ті самі requests до /health.
   *   Сам request до Render запускає cold start,
   *   якщо сервіс зараз sleeping.
   *
   * Різниця між Check status та Wake Backend
   * знаходиться на frontend:
   *
   * Check status -> один GET
   *
   * Wake Backend -> POST + polling через GET
   */

  const result = await checkAllServices()

  return createJsonResponse({
    action: method === 'POST' ? 'wake' : 'check',
    ...result,
  })
}
