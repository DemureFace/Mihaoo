export function getApiErrorMessage(error, fallback = 'Request failed') {
  const data = error?.response?.data || error?.data
  const message = data?.error?.message || data?.message
  if (Array.isArray(message)) return message.join('; ')
  return typeof message === 'string' ? message : error?.message || fallback
}

export function downloadFilename(disposition, fallback) {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)
  const plain = disposition?.match(/filename="?([^";]+)"?/i)
  let name = plain?.[1] || fallback
  if (encoded) {
    try {
      name = decodeURIComponent(encoded[1])
    } catch {
      // Keep the safe fallback when the header is malformed.
    }
  }
  return name.replace(/[/\\]/g, '_')
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
