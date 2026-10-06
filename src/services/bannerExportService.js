import api from './api'
import { downloadFilename } from './apiError'

export async function inspectBannerExport(figmaUrl, signal) {
  const { data } = await api.post(
    '/banner-exports/inspect',
    { figmaUrl },
    { signal, timeout: 45000 },
  )
  if (!data || !Array.isArray(data.banners))
    throw new Error('Unexpected banner inspection response')
  return data
}

export async function createBannerExport(payload) {
  const { data } = await api.post('/banner-exports', payload, { timeout: 45000 })
  if (!data?.id) throw new Error('Unexpected banner export response')
  return data
}

export async function getBannerExport(jobId, signal) {
  const { data } = await api.get(`/banner-exports/${encodeURIComponent(jobId)}`, {
    signal,
    timeout: 20000,
  })
  if (!data?.id || !data.status) throw new Error('Unexpected banner job response')
  return data
}

export async function getBannerExportManifest(jobId, signal) {
  const { data } = await api.get(`/banner-exports/${encodeURIComponent(jobId)}/manifest`, {
    signal,
    timeout: 20000,
  })
  return data
}

export async function downloadBannerExport(jobId) {
  const response = await api.get(`/banner-exports/${encodeURIComponent(jobId)}/download`, {
    responseType: 'blob',
    timeout: 45000,
  })
  return {
    blob: response.data,
    filename: downloadFilename(
      response.headers['content-disposition'],
      `banner-export-${jobId}.zip`,
    ),
  }
}
