
import dns from 'node:dns/promises'
import net from 'node:net'

function isPrivate(address) {
  if (net.isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number)
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
  }
  const value = address.toLowerCase()
  return value === '::1' || value === '::' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb')
}

async function validateTarget(url) {
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Hanya URL HTTP/HTTPS yang didukung.')
  if (url.username || url.password) throw new Error('URL dengan username/password tidak diizinkan.')
  const addresses = await dns.lookup(url.hostname, { all: true })
  if (!addresses.length || addresses.some(row => isPrivate(row.address))) throw new Error('Alamat lokal/private tidak diizinkan.')
  return addresses.map(row => row.address)
}

async function inspectUrl(input) {
  let url = new URL(input)
  const chain = []
  for (let redirects = 0; redirects <= 5; redirects++) {
    const addresses = await validateTarget(url)
    const started = Date.now()
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      headers: { 'User-Agent': 'Usanagi-Umi-Link-Checker/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if ([405, 501].includes(response.status)) {
      response = await fetch(url, {
        method: 'GET', redirect: 'manual',
        headers: { 'User-Agent': 'Usanagi-Umi-Link-Checker/1.0', Range: 'bytes=0-0' },
        signal: AbortSignal.timeout(15000),
      })
    }
    chain.push({ url: url.href, status: response.status, ms: Date.now() - started })
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      url = new URL(response.headers.get('location'), url)
      continue
    }
    return { response, url, chain, addresses }
  }
  throw new Error('Terlalu banyak redirect.')
}

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`Masukkan URL.\n\nContoh: ${usedPrefix}${command} https://example.com`)
  await m.react?.('🔎')
  try {
    const result = await inspectUrl(text.trim())
    const { response, url, chain, addresses } = result
    const status = response.status
    const safeStatus = status >= 200 && status < 400
    const report = [
      '🔗 *UMI LINK INSPECTOR*',
      '',
      `URL akhir: ${url.href}`,
      `Status: ${status} ${response.statusText}`,
      `Tipe: ${response.headers.get('content-type') || '-'}`,
      `Ukuran: ${response.headers.get('content-length') || '-'}`,
      `Server: ${response.headers.get('server') || '-'}`,
      `IP: ${addresses.join(', ')}`,
      `HTTPS: ${url.protocol === 'https:' ? 'Ya' : 'Tidak'}`,
      `Redirect: ${Math.max(0, chain.length - 1)}`,
      `Waktu: ${chain.reduce((sum, row) => sum + row.ms, 0)} ms`,
      '',
      safeStatus ? '✅ Endpoint dapat dijangkau.' : '⚠️ Endpoint merespons dengan status error.',
      '_Hasil ini memeriksa konektivitas dan metadata, bukan jaminan bahwa konten bebas phishing/malware._',
      'By AlzRiss - Usanagi Umi AI',
    ].join('\n')
    await m.reply(report)
    await m.react?.(safeStatus ? '✅' : '⚠️')
  } catch (error) {
    await m.react?.('❌')
    return m.reply(`Link tidak dapat diperiksa: ${error.message}`)
  }
}

handler.command = /^(checklink|validatelink|ceklink)$/i
handler.help = ['checklink <url>']
handler.tags = ['tools']
handler.limit = true
handler.description = 'Memeriksa status dan metadata URL dengan perlindungan SSRF'

export default handler
