
import {
    anilist,
    getJson,
    getText,
    htmlToText,
    react,
    trimText,
    toAbsoluteUrl
} from '../../lib/awang-anime.js';
import { sendInteractive as sendUsanagiInteractive } from '../../lib/awang-tombol.js';

const BASE = 'https://otakudesu.blog';

const ANILIST_SEARCH = `query ($search: String!) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
      id
      title { romaji english native }
      status
      format
      episodes
      averageScore
      siteUrl
      coverImage { large }
      genres
    }
  }
}`;

const ANILIST_AIRING = `query {
  Page(page: 1, perPage: 10) {
    media(type: ANIME, status: RELEASING, isAdult: false, sort: UPDATED_AT_DESC) {
      id
      title { romaji english native }
      status
      format
      episodes
      averageScore
      siteUrl
      coverImage { large }
      nextAiringEpisode { airingAt episode }
      genres
    }
  }
}`;

const ANILIST_DETAIL = `query ($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    description(asHtml: false)
    status
    format
    episodes
    duration
    averageScore
    popularity
    favourites
    season
    seasonYear
    countryOfOrigin
    siteUrl
    coverImage { large }
    genres
    studios { nodes { name } }
    nextAiringEpisode { airingAt episode }
  }
}`;

const normalizeTitle = (item) => trimText(item?.title?.english || item?.title?.romaji || item?.title?.native || item?.title || 'Tanpa judul', 75);

const parseSiteLinks = (html) => {
    const out = [];
    const seen = new Set();
    const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = re.exec(html))) {
        const href = toAbsoluteUrl(match[1], BASE);
        const title = htmlToText(match[2], 100);
        if (!href || !title) continue;
        if (!/otakudesu\.blog\//i.test(href)) continue;
        if (!/(?:\/anime\/|\/episode\/|\/judul\/|\/anime-list\/|\/series\/)/i.test(href)) continue;
        if (/(?:genre|batch|movie|download|episode\/|\?s=)/i.test(href)) continue;
        if (title.length < 2) continue;
        if (seen.has(href)) continue;
        seen.add(href);
        out.push({ title, url: href });
    }
    return out.slice(0, 10);
};

const siteCatalog = async (query = '') => {
    const candidates = query
        ? [
            `${BASE}/?s=${encodeURIComponent(query)}&post_type=anime`,
            `${BASE}/?s=${encodeURIComponent(query)}`
        ]
        : [
            `${BASE}/`,
            `${BASE}/page/1/`,
            `${BASE}/ongoing-anime/`,
            `${BASE}/anime/`
        ];
    for (const url of candidates) {
        try {
            const html = await getText(url, {
                headers: {
                    referer: `${BASE}/`,
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            }, 1);
            const links = parseSiteLinks(html);
            if (links.length) return links;
        } catch {}
    }
    return [];
};

const toItems = (media = [], source = 'anilist') => media.slice(0, 10).map((item) => ({
    id: item.id,
    source,
    title: normalizeTitle(item),
    url: item.siteUrl || '',
    score: item.averageScore ? `${(Number(item.averageScore) / 10).toFixed(1)}` : '-',
    status: item.status || '-',
    format: item.format || '-',
    episodes: item.episodes || '-',
    image: item.coverImage?.large || '',
    genres: Array.isArray(item.genres) ? item.genres.join(', ') : '',
    next: item.nextAiringEpisode ? `Ep ${item.nextAiringEpisode.episode}` : ''
}));

const jikanItems = (data) => (Array.isArray(data?.data) ? data.data : []).slice(0, 10).map((item) => ({
    id: item.mal_id,
    source: 'jikan',
    title: trimText(item.title || item.title_english || 'Tanpa judul', 75),
    url: item.url || '',
    score: Number.isFinite(Number(item.score)) ? Number(item.score).toFixed(1) : '-',
    status: item.status || '-',
    format: item.type || '-',
    episodes: item.episodes || '-',
    image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || '',
    genres: Array.isArray(item.genres) ? item.genres.map((g) => g.name).join(', ') : ''
}));

const searchFallback = async (query) => {
    try {
        const data = await anilist(ANILIST_SEARCH, { search: query });
        const items = toItems(data?.data?.Page?.media, 'anilist');
        if (items.length) return items;
    } catch {}
    try {
        const data = await getJson(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true`);
        const items = jikanItems(data);
        if (items.length) return items;
    } catch {}
    return [];
};

const latestFallback = async () => {
    try {
        const data = await anilist(ANILIST_AIRING);
        const items = toItems(data?.data?.Page?.media, 'anilist');
        if (items.length) return items;
    } catch {}
    try {
        const data = await getJson('https://api.jikan.moe/v4/seasons/now?limit=10&sfw=true');
        const items = jikanItems(data);
        if (items.length) return items;
    } catch {}
    try {
        const data = await getJson('https://api.jikan.moe/v4/top/anime?limit=10&sfw=true');
        const items = jikanItems(data);
        if (items.length) return items;
    } catch {}
    return [];
};

const getAniListDetail = async (id) => {
    const data = await anilist(ANILIST_DETAIL, { id: Number(id) });
    return data?.data?.Media || null;
};

const getJikanDetail = async (id) => {
    const data = await getJson(`https://api.jikan.moe/v4/anime/${encodeURIComponent(id)}/full`);
    return data?.data || null;
};

const siteDetail = async (url) => {
    const html = await getText(url, { headers: { referer: `${BASE}/` } });
    const title = trimText(htmlToText((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [,''])[1], 90), 90);
    const description = trimText(
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
        htmlToText((html.match(/<div[^>]*class=["'][^"']*(?:sinopsis|sinopc|entry-content)[^"']*["'][^>]*>([\s\S]{30,3000}?)<\/div>/i) || [,''])[1], 900),
        900
    );
    const image = toAbsoluteUrl(html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] || '', BASE);
    const plain = htmlToText(html, 9000);
    const score = plain.match(/(?:Rating|Skor)\s*:?\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1] || '-';
    const episodes = plain.match(/(?:Total Episode|Episode)\s*:?\s*([0-9]+)/i)?.[1] || '-';
    const status = plain.match(/Status\s*:?\s*([^\n]{2,50})/i)?.[1]?.trim() || '-';
    return { title: title || 'Anime', description, image, score, episodes, status, url };
};

const formatAniListDetail = (data) => ({
    title: normalizeTitle(data),
    image: data.coverImage?.large || '',
    description: trimText(String(data.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), 900),
    status: data.status || '-',
    format: data.format || '-',
    episodes: data.episodes || '-',
    duration: data.duration ? `${data.duration}m` : '-',
    score: data.averageScore ? `${(Number(data.averageScore) / 10).toFixed(1)}/10` : '-',
    popularity: data.popularity || '-',
    favourites: data.favourites || '-',
    season: data.season && data.seasonYear ? `${data.season} ${data.seasonYear}` : '-',
    country: data.countryOfOrigin || '-',
    studio: data.studios?.nodes?.map((item) => item.name).join(', ') || '-',
    genres: Array.isArray(data.genres) ? data.genres.join(', ') : '-',
    next: data.nextAiringEpisode ? `Episode ${data.nextAiringEpisode.episode}` : '-',
    url: data.siteUrl || ''
});

const formatJikanDetail = (data) => ({
    title: trimText(data.title || data.title_english || 'Anime', 90),
    image: data.images?.webp?.large_image_url || data.images?.jpg?.large_image_url || '',
    description: trimText(data.synopsis || '', 900),
    status: data.status || '-',
    format: data.type || '-',
    episodes: data.episodes || '-',
    duration: data.duration || '-',
    score: Number.isFinite(Number(data.score)) ? `${Number(data.score).toFixed(1)}/10` : '-',
    popularity: data.popularity || '-',
    favourites: data.favorites || '-',
    season: data.season && data.year ? `${data.season} ${data.year}` : '-',
    country: data.country || 'JP',
    studio: Array.isArray(data.studios) ? data.studios.map((item) => item.name).join(', ') : '-',
    genres: Array.isArray(data.genres) ? data.genres.map((item) => item.name).join(', ') : '-',
    next: data.broadcast?.string || '-',
    url: data.url || ''
});

const sendList = async (m, items, query) => {
    const rows = items.map((item, index) => ({
        title: `${index + 1}. ${trimText(item.title, 60)}`,
        description: trimText([item.score !== '-' ? `Score ${item.score}` : '', item.status !== '-' ? item.status : '', item.next || ''].filter(Boolean).join(' · ') || 'Buka detail anime', 70),
        command: item.source === 'anilist' ? `.otakudesu ani:${item.id}` : item.source === 'jikan' ? `.otakudesu mal:${item.id}` : `.otakudesu ${item.url}`
    }));
    const conn = m.conn;
    if (!conn) throw new Error('NO_CONN');
    await sendUsanagiInteractive(conn, m.chat, {
        title: 'Otakudesu',
        body: `Query: ${trimText(query || 'Anime terbaru', 48)}\nHasil: ${items.length}\n\nPilih judul untuk melihat detail.`,
        footer: 'Usanagi Umi AI • Otakudesu',
        list: {
            listTitle: 'Pilih Anime',
            sections: [{ title: 'Daftar Anime', rows }]
        },
        fallbackToText: false
    }, { quoted: m.raw });
};

const sendDetail = async (m, data) => {
    const detail = [
        `╭─〔 ${trimText(data.title, 70).toUpperCase()} 〕`,
        `│ Status    : ${trimText(data.status, 35)}`,
        `│ Format    : ${trimText(data.format, 25)}`,
        `│ Episode   : ${trimText(String(data.episodes), 20)}`,
        `│ Durasi    : ${trimText(data.duration, 20)}`,
        `│ Score     : ${trimText(data.score, 20)}`,
        `│ Popular   : ${trimText(String(data.popularity), 20)}`,
        `│ Favorit   : ${trimText(String(data.favourites), 20)}`,
        `│ Season    : ${trimText(data.season, 30)}`,
        `│ Studio    : ${trimText(data.studio, 55)}`,
        `│ Genre     : ${trimText(data.genres, 80)}`,
        data.next !== '-' ? `│ Jadwal    : ${trimText(data.next, 35)}` : '',
        '',
        `│ ${trimText(data.description || 'Sinopsis tidak tersedia.', 850)}`,
        '',
        `│ URL       : ${trimText(data.url, 120)}`,
        `╰──────────────`
    ].filter(Boolean).join('\n');
    await m.reply(detail);
};

const handler = async function (m, { conn } = {}) {
    m.conn = conn || m.conn;
    const query = String(m.text || '').trim();
    await react(m, '⏳');
    try {
        if (/^ani:\d+$/i.test(query)) {
            const id = Number(query.slice(4));
            const data = await getAniListDetail(id);
            if (!data) throw new Error('EMPTY');
            await sendDetail(m, formatAniListDetail(data));
            await react(m, '✅');
            return;
        }
        if (/^mal:\d+$/i.test(query)) {
            const id = Number(query.slice(4));
            const data = await getJikanDetail(id);
            if (!data) throw new Error('EMPTY');
            await sendDetail(m, formatJikanDetail(data));
            await react(m, '✅');
            return;
        }
        if (/^https?:\/\//i.test(query)) {
            const data = await siteDetail(query);
            await sendDetail(m, data);
            await react(m, '✅');
            return;
        }
        let items = await siteCatalog(query);
        if (!items.length) items = query ? await searchFallback(query) : await latestFallback();
        if (!items.length) throw new Error('EMPTY');
        const normalized = items.map((item) => item.source ? item : { ...item, source: 'site' });
        await sendList(m, normalized, query);
        await react(m, '✅');
    } catch {
        await react(m, '❌');
        await m.reply('Data anime belum dapat diambil saat ini. Coba lagi sebentar.');
    }
};

handler.command = /^(otakudesu|otaku)$/i;
handler.help = ['otakudesu'];
handler.tags = ['anime'];

export default handler;
