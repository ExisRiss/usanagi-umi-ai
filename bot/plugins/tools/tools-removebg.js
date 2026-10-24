/**
  *» Nama :* — [ REMOVE BACKGROUND - AI ] —
  *» Type :* Plugin - ESM
  *» Base Url :* https://www.photoroom.com/tools/background-remover
   * By AlzRiss - Usanagi Umi AI
**/

import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'

let idToken = null
let refreshToken = String(global.externalApiKeys?.photoRoomRefreshToken || '')
let tokenExpiry = 0

async function getValidIdToken() {
    const now = Date.now()
    
    if (idToken && (tokenExpiry - now) > 5 * 60 * 1000) {
        return idToken
    }
    
    try {
        if (!refreshToken || !global.externalApiKeys?.photoRoomFirebase) throw new Error('Credential PhotoRoom belum diisi di config.js')
        const response = await axios({
            method: 'post',
            url: 'https://securetoken.googleapis.com/v1/token',
            params: { key: String(global.externalApiKeys?.photoRoomFirebase || '') },
            headers: {
                'Content-Type': 'application/json',
                'X-Android-Package': 'com.photoroom.app',
                'X-Android-Cert': '0424A4898A4B33940D8BF16E44251B876E97F8D0',
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 14; sdk_gphone64_x86_64 Build/UE1A.230829.036.A4)'
            },
            data: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }
        })

        idToken = response.data.id_token
        refreshToken = response.data.refresh_token
        tokenExpiry = Date.now() + (parseInt(response.data.expires_in) * 1000)
        
        return idToken
        
    } catch (error) {
        throw new Error('Gagal mendapatkan token: ' + error.message)
    }
}

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) return m.reply(`Kirim/reply gambar dengan caption *${usedPrefix + command}*`)

    m.reply('Sedang memproses...')

    try {
        const authToken = await getValidIdToken()
        
        let img = await q.download()
        let form = new FormData()

        form.append('sourceImage', img, { filename: 'source.jpg', contentType: 'image/jpeg' })
        form.append('user_id', '48acFOd8fTfvyjU0nI4oaqKB7512')
        form.append('resize_mask', 'false')
        form.append('model_type', 'free')
        form.append('experiment_flag', 'default')

        const response = await axios({
            method: 'post',
            url: 'https://segmentation-inference.photoroom.com/v1/mask',
            data: form,
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'okhttp/5.3.2',
                'authorization': authToken,
                'pr-app-version': '2026.07.02 (2274)',
                'pr-platform': 'android'
            }
        })

        if (response.data && response.data.b64_mask) {
            let maskBuffer = Buffer.from(response.data.b64_mask, 'base64')
            const metadata = await sharp(maskBuffer).metadata()
            
            const result = await sharp(img)
                .resize(metadata.width, metadata.height)
                .joinChannel(maskBuffer)
                .png()
                .toBuffer()

            await conn.sendFile(m.chat, result, 'result.png', '✅ Berhasil menghapus background!', m)
        } else {
            throw 'Gagal mendapatkan mask dari API.'
        }

    } catch (error) {
        if (error.response) {
            let detail = error.response.data.toString()
            m.reply(`❌ *API ERROR*:\n\`\`\`${detail}\`\`\``)
        } else {
            m.reply(`❌ *Error:* ${error.message}`)
        }
    }
}

handler.help = ['removebg']
handler.tags = ['tools']
handler.command = ['removebg', 'rbg']

export default handler