const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function inspectBannerExport(figmaUrl) {
  const response = await fetch(`${API_URL}/banner-exports/inspect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ figmaUrl }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {

    throw new Error(data?.message || data?.error || 'Failed to inspect Figma banners')
  }

  return data
}

export async function createBannerExport(payload) {
  const response = await fetch(`${API_URL}/banner-exports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to create banner export')
  }

  return data
}

export async function getBannerExport(jobId) {
  const response = await fetch(`${API_URL}/banner-exports/${jobId}`)

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to get banner export')
  }

  return data
}
async function readJsonResponse(response) {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || 'Request failed')

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}

export function getBannerExportDownloadUrl(jobId) {
  return `${API_URL}/banner-exports/${jobId}/download`
}
export async function getBannerExportManifest(jobId) {
  const response = await fetch(`${API_URL}/banner-exports/${jobId}/manifest`)

  return readJsonResponse(response)
}
