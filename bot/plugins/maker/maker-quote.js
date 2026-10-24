/**
✧ Name   : quotes kata"
✧ Category : Canvas
✧ *Note* : Jangan hapus wm dan jika ada yang kurang sesuai aja ya
**/

import axios from 'axios'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`cara pakai *${usedPrefix + command}* :\n\n` +
            `format: *${usedPrefix + command} teks quotes atau kata-kata*\n` +
            `contoh: *${usedPrefix + command} jangan terlalu sibuk mengejar dunia sampai sholat 5 waktu di tinggalin*\n\n` +
            `_Rinn bakal bikin gambar quotes chat keren buat kamu~ 📱🌸_`
        )
    }

    const qcrinText = text.trim()
    await conn.sendMessage(m.chat, { react: { text: '🕐', key: m.key } })

    try {
        const QCRIN_BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/qc.png'
        const QCRIN_DIR = join(process.cwd(), 'assets', 'qcrin')
        const QCRIN_BG_LOCAL = join(QCRIN_DIR, 'qc.png')
        const QCRIN_FONTS_DIR = join(QCRIN_DIR, 'fonts')
        const QCRIN_TMP = join(process.cwd(), 'tmp')

        const INTER_FONTS_QC = [
            { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', file: 'Inter-Regular.ttf' },
            { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', file: 'Inter-Medium.ttf' },
            { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', file: 'Inter-SemiBold.ttf' },
        ]

        const BG_W = 1080
        const BG_H = 2280

        await mkdir(QCRIN_FONTS_DIR, { recursive: true })
        await mkdir(QCRIN_TMP, { recursive: true })

        async function qcrinDownload(url) {
            const res = await axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5 })
            return Buffer.from(res.data)
        }

        for (const f of INTER_FONTS_QC) {
            const dest = join(QCRIN_FONTS_DIR, f.file)
            if (!existsSync(dest)) await writeFile(dest, await qcrinDownload(f.url))
            GlobalFonts.registerFromPath(dest, 'Inter')
        }

        if (!existsSync(QCRIN_BG_LOCAL)) {
            await writeFile(QCRIN_BG_LOCAL, await qcrinDownload(QCRIN_BG_URL))
        }

        const canvas = createCanvas(BG_W, BG_H)
        const ctx = canvas.getContext('2d')
        const bgImg = await loadImage(QCRIN_BG_LOCAL)
        ctx.drawImage(bgImg, 0, 0, BG_W, BG_H)

        function qcrinWrapByWords(text, wordsPerLine = 3) {
            const cleanText = text.replace(/\s+/g, ' ').trim()
            const words = cleanText.split(' ')
            const lines = []
            
            for (let i = 0; i < words.length; i += wordsPerLine) {
                const line = words.slice(i, i + wordsPerLine).join(' ')
                if (line) lines.push(line)
            }
            return lines
        }

        const textLines = qcrinWrapByWords(qcrinText, 3)
        const fontSize = 55
        const lineGap = 5
        const centerX = 443
        const centerY = 1192

        ctx.font = `600 ${fontSize}px Inter`
        ctx.fillStyle = '#111111'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const lineHeight = fontSize + lineGap
        const totalTextHeight = textLines.length * lineHeight

        ctx.save()
        ctx.translate(centerX, centerY)

        let startY = 0 - (totalTextHeight / 2) + (fontSize / 2)

        for (let i = 0; i < textLines.length; i++) {
            ctx.fillText(textLines[i], 0, startY + (i * lineHeight))
        }

        ctx.restore()

        const qcrinOut = join(QCRIN_TMP, `qcrin-${Date.now()}.png`)
        await writeFile(qcrinOut, await canvas.encode('png'))

        await conn.sendMessage(m.chat, {
            image: { url: qcrinOut },
            caption: '📱 _Quotes Chat by Rinn~ 🌸_'
        }, { quoted: m })
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        const { unlink: qcrinUnlink } = await import('node:fs/promises')
        if (existsSync(qcrinOut)) await qcrinUnlink(qcrinOut)

    } catch (e) {
        console.error('qcrin error:', e.message || e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        throw '❌ Gagal memproses gambar Quotes Chat!'
    }
}

handler.help = ['quote']
handler.tags = ['maker']
handler.command = /^(quote)$/i
handler.limit = true
handler.register = true

export default handler