/* By AlzRiss - Usanagi Umi AI */

export async function fetchBuffer(url, {
  timeout = 60000,
  maxBytes = 20 * 1024 * 1024,
  headers = {},
} = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength > maxBytes) {
      throw new Error(
        `Ukuran file terlalu besar (${Math.ceil(declaredLength / 1024 / 1024)} MB).`
      )
    }

    const reader = response.body?.getReader()
    if (!reader) {
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length > maxBytes) throw new Error('Ukuran file melebihi batas yang diizinkan.')
      return { buffer, contentType: response.headers.get('content-type') || '' }
    }

    const chunks = []
    let total = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => {})
        throw new Error('Ukuran file melebihi batas yang diizinkan.')
      }

      chunks.push(Buffer.from(value))
    }

    return {
      buffer: Buffer.concat(chunks, total),
      contentType: response.headers.get('content-type') || '',
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request melebihi batas waktu ${Math.ceil(timeout / 1000)} detik.`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export default { fetchBuffer }
