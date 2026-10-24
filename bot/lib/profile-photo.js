// Resolve/download before sendMessage so a missing/private/expired avatar does
// not abort .me, and a delivery failure is never retried as a duplicate text.
const MAX_BYTES = 2 * 1024 * 1024
function isImage(bytes) {
  return (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ||
    (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP')
}
export async function profilePhoto(conn, jid, { fetchImpl = globalThis.fetch, timeoutMs = 6500 } = {}) {
  const controller = new AbortController()
  let timer
  const download = async () => {
    const value = await conn.profilePictureUrl(jid, 'image')
    if (Buffer.isBuffer(value)) return value.length <= MAX_BYTES && isImage(value) ? value : undefined
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !/(^|\.)whatsapp\.(net|com)$/.test(url.hostname)) return undefined
    const response = await fetchImpl(url, { signal: controller.signal, redirect: 'error' })
    if (!response.ok || !/^image\/(jpeg|png|webp)(;|$)/i.test(response.headers.get('content-type') || '') || Number(response.headers.get('content-length')) > MAX_BYTES) { void response.body?.cancel().catch(() => {}); return undefined }
    const reader = response.body?.getReader(); if (!reader) return undefined
    const chunks = []; let size = 0
    try { for (;;) { const { done, value: chunk } = await reader.read(); if (done) break; size += chunk.length; if (size > MAX_BYTES) return undefined; chunks.push(Buffer.from(chunk)) } }
    finally { void reader.cancel().catch(() => {}) }
    const bytes = Buffer.concat(chunks)
    return isImage(bytes) ? bytes : undefined
  }
  try { return await Promise.race([download(), new Promise(resolve => { timer = setTimeout(() => { controller.abort(); resolve(undefined) }, timeoutMs) })]) }
  catch { return undefined }
  finally { clearTimeout(timer); controller.abort() }
}
