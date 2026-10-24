/* By AlzRiss - Usanagi Umi AI */

import {
    getJson,
    getText,
    htmlToText,
    react,
    trimText
} from '../../lib/awang-anime.js';

const quoteSources = [
    async () => {
        const data = await getJson('https://api.animechan.io/v1/quotes/random');
        return data?.data || data;
    },
    async () => {
        const data = await getJson('https://animechan.xyz/api/random');
        return data;
    },
    async () => {
        const html = await getText('https://otakotaku.com/quote/feed/');
        const blocks = [...html.matchAll(/<a\b[^>]*href=["']([^"']*\/quote\/view\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
        if (!blocks.length) return null;
        const pick = blocks[Math.floor(Math.random() * blocks.length)];
        const detail = await getText(pick[1]);
        const content = htmlToText((detail.match(/(?:quote|kata-kata)[\s\S]{0,1200}/i) || [,''])[0], 700);
        return {
            content,
            anime: { name: htmlToText(pick[2], 80) },
            character: { name: 'Unknown' }
        };
    }
];

const normalize = (payload) => {
    if (!payload) return null;
    return {
        content: payload.content || payload.quote || payload.text || payload.quoteText || '',
        character: payload.character?.name || payload.character || payload.author || '-',
        anime: payload.anime?.name || payload.anime || payload.source || '-',
        episode: payload.episode || payload.episode_number || '-'
    };
};

const handler = async function (m, { conn } = {}) {
        m.conn = conn || m.conn;
        await react(m, '⏳');
        try {
            let quote = null;
            for (const source of quoteSources) {
                try {
                    quote = normalize(await source());
                    if (quote?.content) break;
                } catch {}
            }
            if (!quote?.content) throw new Error('EMPTY');
            const text = `╭─〔 ANIME QUOTE 〕
│ Character : ${trimText(quote.character, 48)}
│ Anime     : ${trimText(quote.anime, 58)}
│ Episode   : ${trimText(quote.episode, 18)}
│
│ “${trimText(quote.content, 620)}”
╰──────────────`;
            await m.reply(text);
            await react(m, '✅');
        } catch {
            await react(m, '❌');
            await m.reply('Quote anime belum tersedia saat ini. Coba lagi sebentar.');
        }
};

handler.command = /^(animequotes|quoteanime)$/i
handler.help = ['animequotes']
handler.tags = ['anime']

export default handler
