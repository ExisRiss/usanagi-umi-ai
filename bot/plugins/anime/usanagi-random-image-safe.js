
import {
    getJson,
    react,
    sendImage,
    trimText
} from '../../lib/awang-anime.js';

const sources = [
    async () => getJson('https://api.nekosia.cat/api/v1/images/waifu?rating=safe'),
    async () => getJson('https://nekos.best/api/v2/neko?amount=1')
];

const normalize = (payload) => {
    if (payload?.image?.compressed?.url) return {
        url: payload.image.compressed.url,
        name: payload?.anime?.title || 'Anime Image'
    };
    const item = payload?.results?.[0] || (Array.isArray(payload) ? payload[0] : payload);
    const url = item?.url || item?.image_url || item?.image?.url || item?.image;
    return url ? { url, name: item?.anime_name || item?.name || 'Anime Image' } : null;
};

const handler = async function (m, { conn } = {}) {
        m.conn = conn || m.conn;
        await react(m, '⏳');
        try {
            let result = null;
            for (const source of sources) {
                try {
                    result = normalize(await source());
                    if (result?.url) break;
                } catch {}
            }
            if (!result?.url) throw new Error('EMPTY');
            await sendImage(m, result.url, `╭─〔 ANIME IMAGE 〕
│ Source : ${trimText(result.name, 60)}
╰──────────────`);
            await react(m, '✅');
        } catch {
            await react(m, '❌');
            await m.reply('Gambar anime belum tersedia saat ini. Coba lagi sebentar.');
        }
};

handler.command = /^loli$/i
handler.help = ['loli']
handler.tags = ['anime']

export default handler
