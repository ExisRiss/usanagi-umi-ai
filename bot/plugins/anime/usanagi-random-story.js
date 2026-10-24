
import {
    getJson,
    getText,
    react,
    sendGif,
    sendVideo,
    trimText
} from '../../lib/awang-anime.js';

const sources = [
    async () => {
        const response = await getJson('https://anime-gifs.aaron-lun.workers.dev/random');
        return response?.url || response?.gif || response?.data?.url || response;
    },
    async () => {
        const response = await getJson('https://nekos.best/api/v2/hug?amount=1');
        return response?.results?.[0]?.url || '';
    },
    async () => {
        const response = await getJson('https://nekos.best/api/v2/wink?amount=1');
        return response?.results?.[0]?.url || '';
    }
];

const handler = async function (m, { conn } = {}) {
        m.conn = conn || m.conn;
        await react(m, '⏳');
        try {
            let url = '';
            for (const source of sources) {
                try {
                    url = String(await source() || '');
                    if (url) break;
                } catch {}
            }
            if (!url) throw new Error('EMPTY');
            const caption = `╭─〔 ANIME STORY 〕
│ Random short anime animation
╰──────────────`;
            try {
                await sendGif(m, url, caption);
            } catch {
                await sendVideo(m, url, caption);
            }
            await react(m, '✅');
        } catch {
            await react(m, '❌');
            await m.reply('Video story anime belum tersedia saat ini. Coba lagi sebentar.');
        }
};

handler.command = /^storyanime$/i
handler.help = ['storyanime']
handler.tags = ['anime']

export default handler
