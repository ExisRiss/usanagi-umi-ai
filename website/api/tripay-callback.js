import { getBotApiConfig } from './_bot-config.js'
import { securityHeaders } from './_security.js'

export const config = { api: { bodyParser: false } }

async function rawBody(req, limit = 128 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw Object.assign(new Error('Payload terlalu besar.'), { status: 413 })
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  securityHeaders(res)
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Metode callback tidak diizinkan.' })
  }

  try {
    const body = await rawBody(req)
    if (!body.length) return res.status(400).json({ error: 'Payload callback kosong.' })
    const bot = await getBotApiConfig()
    const upstream = await fetch(`${bot.origin}/api/payment/tripay/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': String(req.headers['content-type'] || 'application/json'),
        Accept: 'application/json',
        'X-Callback-Signature': String(req.headers['x-callback-signature'] || ''),
        'X-Callback-Event': String(req.headers['x-callback-event'] || ''),
        'User-Agent': 'Usanagi-Umi-TriPay-Callback/1.0',
      },
      body,
      redirect: 'error',
      signal: AbortSignal.timeout(25_000),
    })
    const result = Buffer.from(await upstream.arrayBuffer())
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
    return res.send(result)
  } catch (error) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    return res.status(error?.status || (timeout ? 504 : 502)).json({ error: timeout ? 'Callback payment gateway timeout.' : 'Callback payment gateway tidak dapat diproses.' })
  }
}
