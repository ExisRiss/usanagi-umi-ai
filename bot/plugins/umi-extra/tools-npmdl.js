/* By AlzRiss - Usanagi Umi AI */
/*
  Fitur tambahan hasil audit FURINA V17 → Usanagi Umi AI.
*/

import axios from 'axios'
import { createWriteStream, existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

const pluginConfig = {
    name: 'npmdl',
    alias: ['npmdownload'],
    category: 'tools',
    description: 'Download package NPM dalam format tarball .tgz',
    usage: '.npmdl <package atau URL NPM>',
    example: '.npmdl axios',
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const REGISTRY = 'https://registry.npmjs.org'

async function handler(m) {
    let packageName = m.text?.trim()
    if (!packageName) return m.reply(`Contoh: ${m.prefix}npmdl axios`)

    const match = packageName.match(/npmjs\.com\/package\/([^/?#]+)/i)
    if (match) packageName = match[1]
    packageName = packageName.replace(/^@/, '@').trim().toLowerCase()

    try {
        m.react('⌛')
        const { data } = await axios.get(`${REGISTRY}/${packageName.split('/').map(encodeURIComponent).join('/')}`, {
            headers: { 'User-Agent': 'Usanagi-Umi-AI NPM Downloader' },
            timeout: 20000
        })

        const version = data?.['dist-tags']?.latest
        const pkg = version ? data.versions?.[version] : null
        const tarball = pkg?.dist?.tarball
        if (!version || !tarball) throw new Error('Package atau tarball tidak ditemukan')

        const safeName = packageName.replace(/[^a-zA-Z0-9._-]/g, '_')
        const fileName = `${safeName}-${version}.tgz`
        const tempDir = resolve('./temp')
        const filePath = resolve(tempDir, fileName)
        mkdirSync(tempDir, { recursive: true })

        const response = await axios.get(tarball, {
            responseType: 'stream',
            timeout: 60000,
            maxContentLength: 100 * 1024 * 1024,
            headers: { 'User-Agent': 'Usanagi-Umi-AI NPM Downloader' }
        })

        const writer = createWriteStream(filePath)
        response.data.pipe(writer)
        await new Promise((resolvePromise, rejectPromise) => {
            writer.on('finish', resolvePromise)
            writer.on('error', rejectPromise)
            response.data.on('error', rejectPromise)
        })

        const caption = [
            '📦 *NPM PACKAGE DOWNLOADER*',
            '',
            `🏷️ Nama: *${packageName}*`,
            `📌 Versi: *v${version}*`,
            `👤 Author: *${pkg.author?.name || pkg.maintainers?.[0]?.name || '-'}*`,
            `📜 Lisensi: *${typeof pkg.license === 'string' ? pkg.license : pkg.license?.type || '-'}*`,
            `📝 Deskripsi: ${pkg.description || '-'}`
        ].join('\n')

        await m.reply({
            document: readFileSync(filePath),
            mimetype: 'application/gzip',
            fileName,
            caption
        })
        m.react('✅')
        if (existsSync(filePath)) unlinkSync(filePath)
    } catch (error) {
        console.error('[npmdl]', error)
        m.react('❌')
        return m.reply('❌ Gagal mendownload package NPM. Cek nama package atau coba lagi nanti.')
    }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["npmdl", "npmdownload"]
const __umiOriginalHandler = handler
const __umiHandler = async function (m, context = {}) {
  const adapted = Object.create(m)
  Object.defineProperties(adapted, {
    text: { value: String(context.text || ''), writable: true, configurable: true },
    args: { value: context.args || [], writable: true, configurable: true },
    command: { value: String(context.command || '').toLowerCase(), writable: true, configurable: true },
    prefix: { value: context.usedPrefix || '.', writable: true, configurable: true },
    isOwner: { value: Boolean(context.isOwner), writable: true, configurable: true },
    isPremium: { value: Boolean(context.isPrems), writable: true, configurable: true },
    isAdmin: { value: Boolean(context.isAdmin), writable: true, configurable: true },
    isBotAdmin: { value: Boolean(context.isBotAdmin), writable: true, configurable: true }
  })
  return __umiOriginalHandler.call(this, adapted, {
    ...context,
    sock: context.conn,
    conn: context.conn,
    text: String(context.text || ''),
    query: String(context.text || ''),
    args: context.args || [],
    command: String(context.command || '').toLowerCase(),
    prefix: context.usedPrefix || '.',
    usedPrefix: context.usedPrefix || '.',
    db: global.db
  })
}
__umiHandler.help = ["npmdl .npmdl <package atau URL NPM>"]
__umiHandler.tags = ["tools"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
