
import axios from 'axios';
import {
    getText,
    htmlToText,
    react,
    trimText,
    toAbsoluteUrl
} from '../../lib/awang-anime.js';
import { sendInteractive } from '../../lib/awang-tombol.js';

const BASE = 'https://bacakomik.my';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
    Referer: `${BASE}/`
};

const IMAGE_HEADERS = {
    ...HEADERS,
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/jpeg,image/png,*/*;q=0.8'
};

const MAX_COMIC_RESULTS = 10;
const MAX_CHAPTER_ROWS = 60;

const extractAnchors = (html) => {
    const out = [];
    const seen = new Set();
    const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = re.exec(html))) {
        const href = toAbsoluteUrl(match[1], BASE);
        const text = htmlToText(match[2], 120);
        if (!href || !text) continue;
        if (!/bacakomik\.my\/komik\//i.test(href)) continue;
        if (/^(baca|read|chapter|next|previous|daftar)$/i.test(text)) continue;
        const key = href.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ title: text, url: href });
    }
    return out;
};

const extractGenericAnchors = (html) => {
    const out = [];
    const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = re.exec(html))) {
        const href = toAbsoluteUrl(match[1], BASE);
        const text = htmlToText(match[2], 160);
        if (!href || !text) continue;
        out.push({ href, text });
    }
    return out;
};

const extractImages = (html) => {
    const out = [];
    const seen = new Set();
    const re = /<img\b[^>]*(?:data-lazy-src|data-src|data-original|src)=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = re.exec(html))) {
        const url = toAbsoluteUrl(match[1], BASE);
        if (!url) continue;
        if (/logo|icon|avatar|gravatar|favicon|placeholder|banner/i.test(url) && !/\/data\//i.test(url)) continue;
        if (/\.svg(?:\?|$)/i.test(url)) continue;
        if (seen.has(url)) continue;
        seen.add(url);
        out.push(url);
    }
    return out;
};

const chapterNumberValue = (value, fallback = 999999) => {
    const match = String(value ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/);
    const n = Number.parseFloat(match?.[0] || '');
    return Number.isFinite(n) ? n : fallback;
};

const sortChapters = (items = []) => items
    .map((item, index) => ({ ...item, __index: index, __number: chapterNumberValue(item.number) }))
    .sort((a, b) => a.__number - b.__number || a.__index - b.__index)
    .map(({ __index, __number, ...item }) => item);

const chapters = async (url) => {
    const html = await getText(url, { headers: HEADERS });
    const titleHtml = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
        || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    let title = trimText(htmlToText(titleHtml?.[1] || '', 100).replace(/^Komik\s+/i, ''), 100);

    const containers = [
        html.match(/id=["']chapter_list["'][\s\S]*?<\/ul>/i)?.[0],
        html.match(/class=["'][^"']*(?:bxcl|clwd|chapter-list)[^"']*["'][\s\S]*?<\/ul>/i)?.[0],
        html
    ].filter(Boolean);

    const out = [];
    const seen = new Set();

    for (const targetHtml of containers) {
        const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = re.exec(targetHtml))) {
            const href = toAbsoluteUrl(match[1], BASE);
            const text = htmlToText(match[2], 100);
            if (!href || !text) continue;
            const looksLikeChapter = /(?:chapter|ch\.?|bab)\s*[0-9]+(?:\.[0-9]+)?[a-z]?/i.test(text)
                || /(?:-chapter-|\/chapter[-_])\d+/i.test(href);
            if (!looksLikeChapter) continue;
            if (!/^https?:\/\/bacakomik\.my\//i.test(href)) continue;
            if (seen.has(href)) continue;
            seen.add(href);

            const number = text.match(/(?:chapter|ch\.?|bab)\s*([0-9]+(?:\.[0-9]+)?[A-Za-z]*)/i)?.[1]
                || href.match(/chapter[-_]([0-9]+(?:\.[0-9]+)?[A-Za-z]*)/i)?.[1]
                || null;

            out.push({
                title: trimText(text, 75),
                number,
                url: href
            });
        }
        if (out.length >= MAX_CHAPTER_ROWS) break;
    }

    if (!title) {
        const slug = url.match(/\/komik\/([^/]+)/i)?.[1] || '';
        title = trimText(slug.replace(/-/g, ' '), 90);
    }

    return {
        title: title || 'Komik',
        chapters: sortChapters(out).slice(0, MAX_CHAPTER_ROWS)
    };
};

const search = async (query) => {
    const url = query ? `${BASE}/?s=${encodeURIComponent(query)}` : `${BASE}/komik-populer/`;
    const html = await getText(url, { headers: HEADERS });
    return extractAnchors(html)
        .filter((item) => item.title.length > 1)
        .slice(0, MAX_COMIC_RESULTS);
};

const readChapter = async (url) => {
    const html = await getText(url, { headers: HEADERS });
    const h1 = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
        || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
        || html.match(/<title>([\s\S]*?)<\/title>/i);
    const cleaned = trimText(htmlToText(h1?.[1] || '', 140).replace(/^Komik\s+/i, ''), 140);
    const chapterMatch = cleaned.match(/(Chapter\s*[0-9]+(?:\.[0-9]+)?[A-Za-z]*(?:\s*\([^)]*\))?.*)$/i);
    const chapter = trimText(chapterMatch?.[1] || cleaned, 70) || 'Chapter';
    const comic = trimText((chapterMatch ? cleaned.slice(0, chapterMatch.index) : '').trim(), 90) || 'Komik';

    const readerTarget = html.match(/id=["']anjay_ini_id_kh["'][\s\S]*?<\/div>/i)?.[0]
        || html.match(/id=["']readerarea["'][\s\S]*?<\/div>/i)?.[0]
        || html;
    const images = extractImages(readerTarget).slice(0, 80);

    return {
        comic,
        chapter,
        url,
        images
    };
};

const downloadImageBuffer = async (url, referer = BASE) => {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        maxContentLength: 8 * 1024 * 1024,
        maxBodyLength: 8 * 1024 * 1024,
        maxRedirects: 5,
        headers: { ...IMAGE_HEADERS, Referer: referer },
        validateStatus: (status) => status >= 200 && status < 400
    });
    const buffer = Buffer.from(response.data || '');
    if (!buffer.length) throw new Error('EMPTY_IMAGE');
    return buffer;
};

const normalizeQuery = (text) => String(text || '').trim();

const isChapterUrl = (url) => /(?:-chapter-|\/chapter[-_/]|\/baca[-_/])/i.test(url);

const sendAnimeList = async (m, conn, items, query = '') => {
    const rows = items.map((item, index) => ({
        title: `${index + 1}. ${trimText(item.title, 58)}`,
        description: 'Pilih anime untuk membuka pembacaan dari Bab 1',
        command: `.bacakomik ${item.url}`
    }));

    return sendInteractive(conn, m.chat, {
        title: query ? '📚 HASIL KOMIK' : '📚 KOMIK POPULER',
        body: query
            ? `Pencarian: ${trimText(query, 55)}\nPilih anime yang ingin dibaca.`
            : 'Mau membaca anime apa?\nPilih judul untuk mulai dari Bab 1.',
        footer: 'Usanagi Umi AI • BacaKomik',
        list: {
            listTitle: 'Pilih Anime',
            sections: [{
                title: 'Daftar Anime',
                rows
            }]
        },
        fallbackToText: true
    }, { quoted: m.raw });
};

const sendChapterBook = async (m, conn, data, chapterList) => {
    if (!data?.images?.length) throw new Error('NO_PAGE');

    let firstPage = null;
    try {
        firstPage = await downloadImageBuffer(data.images[0], data.url);
    } catch {}

    const currentNumber = chapterList.findIndex((item) => item.url === data.url);
    const currentIndex = currentNumber >= 0 ? currentNumber : 0;
    const rows = chapterList.map((item, index) => ({
        title: `${index + 1}. ${item.number ? `Bab ${item.number}` : `Bab ${index + 1}`}`,
        description: index === currentIndex ? `Sedang dibaca • ${trimText(item.title, 46)}` : trimText(item.title, 58),
        command: `.bacakomik ${item.url}`
    }));

    const numberLabel = data.chapter.match(/(?:Chapter|Bab)\s*([0-9]+(?:\.[0-9]+)?[A-Za-z]*)/i)?.[1] || String(currentIndex + 1);
    const body = [
        `✍️ ${trimText(data.comic, 62)}`,
        `Bab ${trimText(numberLabel, 18)}`,
        `${data.images.length} halaman tersedia`,
        '',
        'Pilih daftar bab di bawah untuk berpindah membaca.'
    ].join('\n');

    const options = {
        title: '📖 Pembaca Komik',
        subtitle: trimText(data.comic, 42),
        body,
        footer: 'Usanagi Umi AI • BacaKomik',
        list: {
            listTitle: 'Pilih Bab',
            sections: [{
                title: 'Daftar Bab',
                rows
            }]
        },
        fallbackToText: true
    };

    if (firstPage) options.image = firstPage;
    else options.body += '\n\n⚠️ Pratinjau halaman tidak tersedia, tetapi daftar bab tetap dapat digunakan.';

    await sendInteractive(conn, m.chat, options, { quoted: m.raw });
};

const handler = async function (m, { conn } = {}) {
    if (!m?.chat || !conn) return;
    m.conn = conn;

    const query = normalizeQuery(m.text);
    await react(m, '⏳');

    try {
        if (!/^https?:\/\//i.test(query)) {
            const items = await search(query);
            if (!items.length) throw new Error('EMPTY_ANIME');
            await sendAnimeList(m, conn, items, query);
            await react(m, '✅');
            return { success: true, stage: 'anime_list' };
        }

        if (!isChapterUrl(query)) {
            const chapterData = await chapters(query);
            if (!chapterData.chapters.length) throw new Error('NO_CHAPTER');

            const first = chapterData.chapters[0];
            const data = await readChapter(first.url);
            if (!data.images.length) throw new Error('NO_PAGE');

            await sendChapterBook(m, conn, data, chapterData.chapters);
            await react(m, '✅');
            return { success: true, stage: 'chapter_1' };
        }


        const data = await readChapter(query);
        if (!data.images.length) throw new Error('NO_PAGE');

        let chapterIndexUrl = '';
        try {
            const html = await getText(query, { headers: HEADERS });
            const comicLink = extractGenericAnchors(html).find((item) => /\/komik\/[^/]+\/?$/i.test(item.href));
            chapterIndexUrl = comicLink?.href || '';
        } catch {}

        if (chapterIndexUrl) {
            const chapterData = await chapters(chapterIndexUrl);
            if (chapterData.chapters.length) {
                await sendChapterBook(m, conn, data, chapterData.chapters);
            } else {
                await sendChapterBook(m, conn, data, [{ title: data.chapter, number: null, url: data.url }]);
            }
        } else {
            await sendChapterBook(m, conn, data, [{ title: data.chapter, number: null, url: data.url }]);
        }

        await react(m, '✅');
        return { success: true, stage: 'chapter' };
    } catch (error) {
        console.log(`[BacaKomik] ${error?.message || error}`);
        await react(m, '❌');
        await m.reply('Data BacaKomik belum dapat dimuat. Coba lagi sebentar.');
        return { success: false, error: error?.message || 'UNKNOWN' };
    }
};

handler.command = /^(bacakomik|komik)$/i;
handler.help = ['bacakomik'];
handler.tags = ['anime'];
handler.category = 'anime';
handler.groupOnly = false;
handler.limit = false;
handler.description = 'Pilih anime, buka satu bab per bubble, lalu pindah bab melalui daftar chapter dalam bubble yang sama.';

export default handler;
