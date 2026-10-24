// Task64: tukar koin RPG menjadi $AS UMI TRADE (tanpa DANA).
// Website hanya meneruskan token akun; verifikasi token, pemotongan koin, dan
// kredit $AS dilakukan bot secara idempoten per referensi.
import { getBotApiConfig } from './_bot-config.js'
import { requestBot } from './_bot-transport.js'
import { assertBodySize, enforceSameOrigin, rateLimit, securityHeaders } from './_security.js'

const send = (res, status, data) => {
  securityHeaders(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  return res.status(status).json(data)
}
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max)

export default async function handler(req, res) {
  try {
    securityHeaders(res)
    assertBodySize(req, 64 * 1024)
    rateLimit(req, 'platform:rpg-topup', 60, 60 * 1000)
    enforceSameOrigin(req)
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Metode tidak diizinkan.' })
    const token = text(req.body?.token, 300)
    if (token.length < 16) return send(res, 400, { ok: false, error: 'Token akun diperlukan.' })
    let botConfig = null
    try { botConfig = await getBotApiConfig() } catch {}
    if (!botConfig?.origin) return send(res, 503, { ok: false, error: 'Relay bot belum siap. Coba lagi sebentar.' })
    const { response, data } = await requestBot(`${String(botConfig.origin).replace(/\/+$/, '')}/api/platform/rpg-koin`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        action: req.body?.action === 'status' ? 'status' : 'convert',
        amountKoin: req.body?.amountKoin,
        reference: text(req.body?.reference, 120),
        number: text(req.body?.number, 25),
        source: text(req.body?.source, 40) || 'umi-games',
      }),
    }, 40000)
    return send(res, response.status, data)
  } catch (error) {
    return send(res, error.status || 500, { ok: false, error: error.message || 'Tukar koin gagal.' })
  }
}
