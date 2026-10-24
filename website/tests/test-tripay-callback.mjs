/* Relay test: preserves a signed raw callback payload without holding merchant secrets. */
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

process.env.UMI_API_ORIGIN = 'https://bot.example.test'
const { default: handler } = await import('../api/tripay-callback.js')

const raw = Buffer.from('{"merchant_ref":"UMITOPTEST","reference":"TPYTEST","status":"PAID","amount":10000}', 'utf8')
const originalFetch = globalThis.fetch
let forwarded = null
globalThis.fetch = async (url, options) => {
  forwarded = { url: String(url), options }
  return new Response(JSON.stringify({ ok: true, credited: true }), { status: 200, headers: { 'content-type': 'application/json' } })
}

function responseMock() {
  return {
    headers: {}, statusCode: 0, payload: null,
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = value },
    status(code) { this.statusCode = code; return this },
    json(value) { this.payload = value; return this },
    send(value) { this.payload = value; return this },
  }
}

try {
  const req = Readable.from([raw])
  req.method = 'POST'
  req.headers = { 'content-type': 'application/json', 'x-callback-signature': 'test-signature', 'x-callback-event': 'payment_status' }
  const res = responseMock()
  await handler(req, res)
  assert.equal(res.statusCode, 200)
  assert.equal(forwarded.url, 'https://bot.example.test/api/payment/tripay/callback')
  assert.equal(Buffer.compare(Buffer.from(forwarded.options.body), raw), 0)
  assert.equal(forwarded.options.headers['X-Callback-Signature'], 'test-signature')
  assert.equal(forwarded.options.headers['X-Callback-Event'], 'payment_status')
  console.log('PASS: TriPay callback relay forwards raw payload and headers only to configured bot origin.')
} finally {
  globalThis.fetch = originalFetch
}
