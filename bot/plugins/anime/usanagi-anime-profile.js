/* By AlzRiss - Usanagi Umi AI */

import {
    anilist,
    cached,
    formatNumber,
    formatScore,
    htmlToText,
    react,
    sendImage,
    trimText
} from '../../lib/awang-anime.js';

const FIELDS = `
id
siteUrl
type
format
status
episodes
duration
averageScore
meanScore
popularity
favourites
season
seasonYear
startDate { year month day }
endDate { year month day }
title { romaji english native }
description(asHtml: false)
genres
studios { nodes { name } }
coverImage { extraLarge large medium color }
`;

const searchAniList = async (query) => {
    const response = await anilist(`
        query ($search: String) {
            Page(page: 1, perPage: 6) {
                media(search: $search, type: ANIME, isAdult: false) {
                    ${FIELDS}
                }
            }
        }
    `, { search: query });
    return response?.data?.Page?.media || [];
};

const pickTitle = (item) => item?.title?.english || item?.title?.romaji || item?.title?.native || 'Tanpa judul';

const searchJikan = async (query) => {
    const { getJson } = await import('../../lib/awang-anime.js');
    const data = await getJson(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=6`);
    return Array.isArray(data?.data) ? data.data : [];
};

const getJikanDetail = async (malId) => {
    const { getJson } = await import('../../lib/awang-anime.js');
    const data = await getJson(`https://api.jikan.moe/v4/anime/${malId}/full`);
    return data?.data || null;
};

const renderAniList = async (m, item) => {
    const genres = Array.isArray(item.genres) ? item.genres.slice(0, 4).join(', ') : '-';
    const studios = Array.isArray(item?.studios?.nodes) ? item.studios.nodes.map((studio) => studio.name).filter(Boolean).slice(0, 3).join(', ') : '-';
    const title = pickTitle(item);
    const caption = [
        `╭─〔 ${trimText(title, 58)} 〕`,
        `│ Format    : ${item.format || '-'}`,
        `│ Status    : ${item.status || '-'}`,
        `│ Score     : ${formatScore(item.averageScore || item.meanScore)}`,
        `│ Popular   : ${formatNumber(item.popularity)}`,
        `│ Favorite  : ${formatNumber(item.favourites)}`,
        `│ Episode   : ${item.episodes || '-'}`,
        `│ Duration  : ${item.duration ? `${item.duration} min` : '-'}`,
        `│ Season    : ${item.season ? `${item.season} ${item.seasonYear || ''}`.trim() : '-'}`,
        `│ Studio    : ${trimText(studios, 80)}`,
        `│ Genre     : ${trimText(genres, 100)}`,
        ``,
        `│ ${htmlToText(item.description, 280) || 'Sinopsis tidak tersedia.'}`,
        item.siteUrl ? `` : '',
        item.siteUrl ? `│ URL       : ${trimText(item.siteUrl, 110)}` : '',
        `╰──────────────`
    ].filter((line) => line !== '').join('\n');
    if (item?.coverImage?.large) {
        await sendImage(m, item.coverImage.large, caption);
    } else if (item?.coverImage?.medium) {
        await sendImage(m, item.coverImage.medium, caption);
    } else {
        await m.reply(caption);
    }
};

const renderJikan = async (m, item) => {
    const title = trimText(item?.title_english || item?.title || 'Tanpa judul', 58);
    const genres = Array.isArray(item?.genres) ? item.genres.slice(0, 4).map((genre) => genre.name).join(', ') : '-';
    const studios = Array.isArray(item?.studios) ? item.studios.slice(0, 3).map((studio) => studio.name).join(', ') : '-';
    const caption = [
        `╭─〔 ${title} 〕`,
        `│ Format    : ${item?.type || '-'}`,
        `│ Status    : ${item?.status || '-'}`,
        `│ Score     : ${formatScore(item?.score)}`,
        `│ Popular   : ${formatNumber(item?.members)}`,
        `│ Favorite  : ${formatNumber(item?.favorites)}`,
        `│ Episode   : ${item?.episodes || '-'}`,
        `│ Duration  : ${trimText(item?.duration || '-', 48)}`,
        `│ Studio    : ${trimText(studios || '-', 80)}`,
        `│ Genre     : ${trimText(genres || '-', 100)}`,
        ``,
        `│ ${htmlToText(item?.synopsis, 280) || 'Sinopsis tidak tersedia.'}`,
        item?.url ? `` : '',
        item?.url ? `│ URL       : ${trimText(item.url, 110)}` : '',
        `╰──────────────`
    ].filter((line) => line !== '').join('\n');
    if (item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url) {
        await sendImage(m, item.images.jpg.large_image_url || item.images.jpg.image_url, caption);
    } else {
        await m.reply(caption);
    }
};

const handler = async function (m, { conn } = {}) {
        m.conn = conn || m.conn;
        const query = String(m.text || '').trim();
        if (!query) return m.reply('Penggunaan: .animeinfo <judul>');
        await react(m, '⏳');
        try {
            const items = await cached(`animeinfo:${query.toLowerCase()}`, () => searchAniList(query), 45_000).catch(() => []);
            const item = items[0];
            if (item) {
                await renderAniList(m, item);
                await react(m, '✅');
                return;
            }
            const fallback = await searchJikan(query);
            if (!fallback.length) throw new Error('EMPTY');
            const detailed = await getJikanDetail(fallback[0].mal_id).catch(() => null);
            await renderJikan(m, detailed || fallback[0]);
            await react(m, '✅');
        } catch {
            await react(m, '❌');
            await m.reply('Data anime belum tersedia saat ini. Coba lagi sebentar.');
        }
};

handler.command = /^(animeinfo|anime)$/i
handler.help = ['animeinfo']
handler.tags = ['anime']

export default handler
