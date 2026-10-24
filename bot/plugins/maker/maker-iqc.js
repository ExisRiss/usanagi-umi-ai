/**
 ✧ FakeIphoneChat - maker ✧
 ───────────────────────────────
 𖣔 Type   : Plugin ESM
  * By AlzRiss - Usanagi Umi AI
 𖣔 Create by : Lznycx
 𖣔 Edit   : ChatGPT
*/

import axios from 'axios'

let handler = async (m, { text, command, conn, usedPrefix }) => {
    if (!text)
        return m.reply(
            `*🧩 Masukkan teks!*\n*Contoh: ${usedPrefix + command} info kangg*`
        )

    await conn.sendMessage(m.chat, {
        react: {
            text: '⏳',
            key: m.key
        }
    })

    const primary =
        `https://brat.siputzx.my.id/iphone-quoted` +
        `?time=12.00` +
        `&batteryPercentage=90` +
        `&carrierName=AXIS` +
        `&messageText=${encodeURIComponent(text)}` +
        `&emojiStyle=apple`

    const fallback =
        `https://api.nexray.eu.cc/maker/iqc?text=${encodeURIComponent(text)}`

    try {
        // Cek API utama
        await axios.get(primary, {
            responseType: 'arraybuffer',
            timeout: 15000
        })

        await conn.sendMessage(
            m.chat,
            {
                image: { url: primary },
                caption: '*✨ iPhone chat berhasil dibuat*'
            },
            { quoted: m }
        )
    } catch (e) {
        console.log('[IQC] Primary gagal, memakai fallback...')

        try {
            await axios.get(fallback, {
                responseType: 'arraybuffer',
                timeout: 15000
            })

            await conn.sendMessage(
                m.chat,
                {
                    image: { url: fallback },
                    caption: '*✨ iPhone chat berhasil dibuat (Fallback API)*'
                },
                { quoted: m }
            )
        } catch (err) {
            console.error(err)
            m.reply('*🍂 Semua server sedang bermasalah. Coba lagi nanti.*')
        }
    } finally {
        await conn.sendMessage(m.chat, {
            react: {
                text: '',
                key: m.key
            }
        })
    }
}

handler.help = ['iqc']
handler.tags = ['maker']
handler.command = /^(iqc|fakeiphonechat)$/i
handler.limit = true
handler.register = false

export default handler