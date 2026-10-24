
import axios from 'axios';
import {
    react,
    sendImage,
    trimText
} from '../../lib/awang-anime.js';

const UA = 'Usanagi Umi AI (https://awangofc.my.id)';

const sources = [
    async () => {
        const { data } = await axios.get('https://nekos.best/api/v2/neko?amount=1', {
            timeout: 12000,
            headers: {
                'User-Agent': UA,
                'Accept': 'application/json'
            }
        });
        const item = Array.isArray(data?.results) ? data.results[0] : null;
        if (!item?.url) throw new Error('NO_NEKO');
        return {
            url: item.url,
            name: item.artist_name || 'NekosBest',
            source: item.source_url || ''
        };
    },
    async () => {
        const { data } = await axios.get('https://nekos.best/api/v2/waifu?amount=1', {
            timeout: 12000,
            headers: {
                'User-Agent': UA,
                'Accept': 'application/json'
            }
        });
        const item = Array.isArray(data?.results) ? data.results[0] : null;
        if (!item?.url) throw new Error('NO_WAIFU');
        return {
            url: item.url,
            name: item.artist_name || 'NekosBest',
            source: item.source_url || ''
        };
    },
    async () => {
        const { data } = await axios.get('https://api.waifu.im/search?included_tags=waifu&is_nsfw=false', {
            timeout: 12000,
            headers: {
                'User-Agent': UA,
                'Accept': 'application/json'
            }
        });
        const item = Array.isArray(data?.images) ? data.images[0] : null;
        if (!item?.url) throw new Error('NO_WAIFU_IM');
        return {
            url: item.url,
            name: item.artist?.name || 'Waifu.im',
            source: item.source || ''
        };
    }
];

const handler = async function (m, { conn } = {}) {
    m.conn = conn || m.conn;
    await react(m, '⏳');
    try {
        let result = null;
        for (const source of sources) {
            try {
                result = await source();
                if (result?.url) break;
            } catch {}
        }
        if (!result?.url) throw new Error('EMPTY');
        const caption = `╭─〔 ANIME IMAGE 〕
│ Source : ${trimText(result.name, 56)}
${result.source ? `│ Source URL : ${trimText(result.source, 88)}\n` : ''}╰──────────────`;
        await sendImage(m, result.url, caption);
        await react(m, '✅');
    } catch {
        await react(m, '❌');
        await m.reply('Gambar anime belum tersedia saat ini. Coba lagi sebentar.');
    }
};

handler.command = /^animeimage$/i;
handler.help = ['animeimage'];
handler.tags = ['anime'];

export default handler
