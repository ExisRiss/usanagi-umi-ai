/* By AlzRiss - Usanagi Umi AI */

import {
    anilist,
    getAiringDay,
    getJson,
    getJakartaDate,
    formatDuration,
    formatScore,
    react,
    sendInteractive,
    trimText
} from '../../lib/awang-anime.js';

const scheduleQuery = `
    query ($after: Int!) {
        Page(page: 1, perPage: 50) {
            airingSchedules(airingAt_greater: $after) {
                id
                airingAt
                episode
                media {
                    id
                    siteUrl
                    title { romaji english native }
                    coverImage { medium large }
                    format
                    status
                    averageScore
                }
            }
        }
    }
`;

const getAniSchedule = async () => {
    const after = Math.floor(Date.now() / 1000) - 3600;
    const response = await anilist(scheduleQuery, { after });
    return response?.data?.Page?.airingSchedules || [];
};

const getJikanSchedule = async () => {
    const response = await getJson('https://api.jikan.moe/v4/schedules?filter=anime&sfw=true');
    return Array.isArray(response?.data) ? response.data : [];
};

const normalize = (item) => {
    const title = item?.media?.title
        ? (item.media.title.english || item.media.title.romaji || item.media.title.native)
        : (item?.title || item?.title_japanese);
    return {
        id: item?.id || item?.mal_id,
        title: trimText(title || 'Tanpa judul', 60),
        time: item?.airingAt ? new Date(item.airingAt * 1000).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : (item?.broadcast?.time || '-'),
        day: item?.airingAt ? getAiringDay(item.airingAt) : (item?.broadcast?.day || '-'),
        episode: item?.episode || '-',
        score: item?.media?.averageScore || item?.score || null,
        url: item?.media?.siteUrl || item?.url || ''
    };
};

const filterDay = (items, dayText) => {
    if (!dayText) return items;
    const normalized = dayText.toLowerCase();
    return items.filter((item) => String(item.day).toLowerCase().startsWith(normalized));
};

const handler = async function (m, { conn } = {}) {
        m.conn = conn || m.conn;
        const query = String(m.text || '').trim();
        await react(m, '⏳');
        try {
            let raw = [];
            try {
                raw = await getAniSchedule();
            } catch {}
            if (!raw.length) raw = await getJikanSchedule();
            let items = raw.map(normalize).filter((item) => item.title && item.title !== 'Tanpa judul');
            items = filterDay(items, query).slice(0, 12);
            if (!items.length) throw new Error('EMPTY');
            const rows = items.map((item, index) => ({
                title: `${index + 1}. ${item.title}`,
                description: trimText(`${item.day} ${item.time} • E${item.episode} • Score ${formatScore(item.score)}`, 72),
                command: `.animeinfo ${item.title}`
            }));
            await sendInteractive(m, {
                text: `╭─〔 ANIME ONGOING 〕\n│ Jadwal : ${trimText(query || 'Mingguan', 40)}\n│ Hasil  : ${items.length}\n╰──────────────`,
                footer: 'Pilih anime untuk melihat detail.',
                buttonText: 'Pilih Anime',
                sectionTitle: 'Jadwal',
                rows
            });
            await react(m, '✅');
        } catch {
            await react(m, '❌');
            await m.reply('Jadwal anime belum tersedia saat ini. Coba lagi sebentar.');
        }
};

handler.command = /^(ongoing|animeongoing)$/i
handler.help = ['ongoing']
handler.tags = ['anime']

export default handler
