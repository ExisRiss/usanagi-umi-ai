/* By AlzRiss - Usanagi Umi AI */

import {
    anilist,
    getJson,
    react,
    sendImage,
    trimText
} from '../../lib/awang-anime.js';

const query = `
    query ($page: Int!, $perPage: Int!) {
        Page(page: $page, perPage: $perPage) {
            media(type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) {
                id
                title { romaji english native }
                siteUrl
                format
                status
                coverImage { large medium }
                averageScore
            }
        }
    }
`;

const randomAniList = async () => {
    const page = 1 + Math.floor(Math.random() * 12);
    const response = await anilist(query, { page, perPage: 25 });
    const items = response?.data?.Page?.media || [];
    if (!items.length) return null;
    return items[Math.floor(Math.random() * items.length)];
};

const randomJikan = async () => {
    const page = 1 + Math.floor(Math.random() * 10);
    const response = await getJson(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=25&sfw=true`);
    const items = Array.isArray(response?.data) ? response.data : [];
    return items.length ? items[Math.floor(Math.random() * items.length)] : null;
};

const handler = async function (m, { conn } = {}) {
        m.conn = conn || m.conn;
        await react(m, '⏳');
        try {
            const item = await randomAniList().catch(() => null) || await randomJikan().catch(() => null);
            if (!item) throw new Error('EMPTY');
            const title = item?.title?.english || item?.title?.romaji || item?.title?.native || item?.title || 'Tanpa judul';
            const score = item?.averageScore || item?.score;
            const status = item?.status || '-';
            const format = item?.format || item?.type || '-';
            const image = item?.coverImage?.large || item?.coverImage?.medium || item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url;
            const url = item?.siteUrl || item?.url || '';
            const text = `╭─〔 ANIME RANDOM 〕
│ Title  : ${trimText(title, 70)}
│ Format : ${trimText(format, 30)}
│ Status : ${trimText(status, 40)}
│ Score  : ${score ? (Number(score) > 10 ? (Number(score) / 10).toFixed(1) : Number(score).toFixed(1)) : '-'}
${url ? `│ URL    : ${trimText(url, 110)}\n` : ''}╰──────────────`;
            if (image) await sendImage(m, image, text);
            else await m.reply(text);
            await react(m, '✅');
        } catch {
            await react(m, '❌');
            await m.reply('Anime acak belum tersedia saat ini. Coba lagi sebentar.');
        }
};

handler.command = /^animerandom$/i
handler.help = ['animerandom']
handler.tags = ['anime']

export default handler
