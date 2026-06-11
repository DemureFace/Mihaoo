const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

export function getBannerExportDownloadUrl(jobId) {
  return `${API_URL}/banner-exports/${jobId}/download`
}
