// Shared backend transport. Never replay mutations or follow redirects with credentials.
export async function requestBot(url, options = {}, timeoutMs = 45000) {
  try {
    const response = await fetch(url, {
      ...options,
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
    })
    const raw = await response.text()
    let data = {}
    if (raw) {
      try { data = JSON.parse(raw) } catch {
        throw Object.assign(new Error('Respons backend Umi tidak valid. Coba lagi sebentar.'), { status: 502, code: 'BOT_INVALID_RESPONSE' })
      }
    } else if (options.method !== 'HEAD' && response.status !== 204) {
      throw Object.assign(new Error('Respons backend Umi kosong. Coba lagi sebentar.'), { status: 502, code: 'BOT_INVALID_RESPONSE' })
    }
    return { response, raw, data }
  } catch (error) {
    if (error?.code === 'BOT_INVALID_RESPONSE') throw error
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    throw Object.assign(new Error(timeout
      ? 'Backend Umi tidak merespons tepat waktu. Coba lagi.'
      : 'Backend Umi sedang tidak dapat dijangkau. Coba lagi sebentar.'), {
      status: timeout ? 504 : 502,
      code: timeout ? 'BOT_TIMEOUT' : 'BOT_UNREACHABLE',
    })
  }
}
