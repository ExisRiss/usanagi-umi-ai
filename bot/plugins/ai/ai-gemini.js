/*
 * Gemini AI Chat - ESM Plugin (API Version)
  * By AlzRiss - Usanagi Umi AI
 *
 * Command:
 * .gemini <prompt>
 */

const handler = async (m, { conn, text, command, usedPrefix }) => {
    try {
        // Pengecekan input kosong
        if (!text?.trim()) {
            return m.reply(
                `❀ *Gemini AI*\n\n` +
                `Contoh Penggunaan:\n` +
                `• ${usedPrefix + command} halo\n` +
                `• ${usedPrefix + command} buatkan kode javascript sederhana\n` +
                `• ${usedPrefix + command} berita populer hari ini`
            )
        }

        // [Opsional] Memberikan reaction agar user tahu bot sedang memproses
        // await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        const prompt = encodeURIComponent(text.trim())
        const model = 'gemini-3.6-flash'
        const apiUrl = `https://api.zavedya.id/v1/ai/gemini?prompt=${prompt}&model=${model}`

        // Menggunakan native fetch bawaan Node.js (Tanpa perlu axios)
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // Menyesuaikan dengan struktur response API Zavedya (bisa data, result, message, atau reply)
        const reply = data?.data || data?.result || data?.message || data?.reply

        if (!reply) {
            return m.reply('❌ Gemini gagal memberikan respons yang valid dari API.')
        }

        // Mengirimkan hasil ke user
        return m.reply(reply)

    } catch (err) {
        console.error('[Gemini API Plugin Error]', err)
        return m.reply(`❌ *Terjadi Kesalahan*\n\n${err.message}`)
    }
}

// Konfigurasi handler bot
handler.help = ['gemini <text>']
handler.tags = ['ai']
handler.command = /^(gemini|gem|gai)$/i
handler.limit = true

export default handler