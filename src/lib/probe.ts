export async function canLoadAsset(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (response.status === 405 || response.status === 501) {
      const fallback = await fetch(url, { method: 'GET' })
      const type = fallback.headers.get('content-type') ?? ''
      return fallback.ok && !type.includes('text/html')
    }
    if (!response.ok) return false
    const type = response.headers.get('content-type') ?? ''
    return !type.includes('text/html')
  } catch {
    return false
  }
}
