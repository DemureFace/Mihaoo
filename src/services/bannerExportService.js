const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function readJsonResponse(response, fallbackMessage = 'Request failed') {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.error || fallbackMessage

    const error = new Error(message)

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}

export async function inspectBannerExport(figmaUrl) {
  const response = await fetch(`${API_URL}/banner-exports/inspect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ figmaUrl }),
  })

  return readJsonResponse(response, 'Failed to inspect Figma banners')
}

export async function createBannerExport(payload) {
  const response = await fetch(`${API_URL}/banner-exports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return readJsonResponse(response, 'Failed to create banner export')
}

export async function getBannerExport(jobId) {
  const response = await fetch(`${API_URL}/banner-exports/${jobId}`)

  return readJsonResponse(response, 'Failed to get banner export')
}

export async function getBannerExportManifest(jobId) {
  const response = await fetch(`${API_URL}/banner-exports/${jobId}/manifest`)

  return readJsonResponse(response, 'Failed to get export manifest')
}

export function getBannerExportDownloadUrl(jobId) {
  return `${API_URL}/banner-exports/${jobId}/download`
}
