/**
  *» Nama :* — [ BACA KOMIK ] —
  *» Type :* Plugin - ESM
  *» Base Url :* https://bacakomik.my
   * By AlzRiss - Usanagi Umi AI
**/

import fs from 'fs';
import path from 'path';

const CREATOR = 'Dwi-Merajah';
const BASE_URL = 'https://bacakomik.my';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
    'Referer': `${BASE_URL}/`,
};

// ==================== HELPER FUNCTIONS ====================

async function fetchHtml(url) {
    const targetUrl = url.startsWith('http')
        ? url
        : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

    const resp = await fetch(targetUrl, {
        headers: HEADERS,
        redirect: 'follow',
    });

    if (!resp.ok) throw new Error(`Gagal fetch ${targetUrl} - HTTP ${resp.status}`);
    return await resp.text();
}

function cleanText(str = '') {
    return String(str)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function successResponse(data) {
    return { creator: CREATOR, status: true, data };
}

function errorResponse(message) {
    return { creator: CREATOR, status: false, message: String(message), data: null };
}

export async function getRekomendasi(limit = 15) {
    try {
        limit = Math.max(1, Math.min(parseInt(limit, 10) || 15, 50));
        const html = await fetchHtml(`${BASE_URL}/komik-populer/`);
        const cards = html.split(/class=["']animepost["']/i).slice(1);
        const results = [];

        for (const block of cards) {
            const urlMatch = block.match(/href=["'](https:\/\/bacakomik\.my\/komik\/[^"']+)["']/i);
            const titleMatch = block.match(/<h4>([^<]+)<\/h4>/i) || block.match(/title=["']([^"']+)["']/i);
            const typeMatch = block.match(/class=["']typeflag\s*([^"']+)["']/i);
            const ratingMatch = block.match(/<i>\s*([0-9.]+)\s*<\/i>/i) || block.match(/class=["']fas fa-star["'][^>]*><\/i>\s*([0-9.]+)/i);
            const thumbMatch = block.match(/data-lazy-src=["']([^"']+)["']/i) || block.match(/src=["'](https:\/\/[^"']+)["']/i);

            if (!urlMatch || !titleMatch) continue;

            let title = cleanText(titleMatch[1]);
            if (title.toLowerCase().startsWith('komik ')) title = title.substring(6).trim();

            results.push({
                title,
                type: typeMatch ? cleanText(typeMatch[1]) : 'Unknown',
                rating: ratingMatch ? ratingMatch[1].trim() : null,
                url: urlMatch[1].trim(),
                thumbnail: thumbMatch ? thumbMatch[1].trim() : null,
            });

            if (results.length >= limit) break;
        }
        return successResponse(results);
    } catch (err) {
        return errorResponse(err.message);
    }
}

export async function searchComic(query) {
    try {
        query = String(query || '').trim();
        if (!query) throw new Error('Query pencarian tidak boleh kosong.');

        const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
        const html = await fetchHtml(searchUrl);
        const cards = html.split(/class=["']animepost["']/i).slice(1);
        const results = [];

        for (const block of cards) {
            const urlMatch = block.match(/href=["'](https:\/\/bacakomik\.my\/komik\/[^"']+)["']/i);
            const titleMatch = block.match(/<h4>([^<]+)<\/h4>/i) || block.match(/title=["']([^"']+)["']/i);
            const typeMatch = block.match(/class=["']typeflag\s*([^"']+)["']/i);
            const ratingMatch = block.match(/<i>\s*([0-9.]+)\s*<\/i>/i) || block.match(/class=["']fas fa-star["'][^>]*><\/i>\s*([0-9.]+)/i);
            const latestChMatch = block.match(/class=["']lsch["'][\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
            const thumbMatch = block.match(/data-lazy-src=["']([^"']+)["']/i) || block.match(/src=["'](https:\/\/[^"']+)["']/i);

            if (!urlMatch || !titleMatch) continue;

            let title = cleanText(titleMatch[1]);
            if (title.toLowerCase().startsWith('komik ')) title = title.substring(6).trim();

            results.push({
                title,
                type: typeMatch ? cleanText(typeMatch[1]) : 'Unknown',
                rating: ratingMatch ? ratingMatch[1].trim() : null,
                latest_chapter: latestChMatch ? cleanText(latestChMatch[2]) : null,
                latest_chapter_url: latestChMatch ? latestChMatch[1].trim() : null,
                url: urlMatch[1].trim(),
                thumbnail: thumbMatch ? thumbMatch[1].trim() : null,
            });
        }
        return successResponse(results);
    } catch (err) {
        return errorResponse(err.message);
    }
}

export async function getAllChapters(comicUrlOrQuery) {
    try {
        let comicUrl = String(comicUrlOrQuery || '').trim();
        if (!comicUrl) throw new Error('Judul atau URL komik tidak boleh kosong.');

        if (!comicUrl.startsWith('http')) {
            const searchRes = await searchComic(comicUrl);
            if (!searchRes.status || !searchRes.data || !searchRes.data.length) {
                throw new Error(`Komik dengan judul "${comicUrl}" tidak ditemukan.`);
            }
            comicUrl = searchRes.data[0].url;
        }

        const html = await fetchHtml(comicUrl);
        const titleMatch = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        let title = titleMatch ? cleanText(titleMatch[1]) : '';
        if (title.toLowerCase().startsWith('komik ')) title = title.substring(6).trim();

        const containerMatch = html.match(/id=["']chapter_list["'][\s\S]*?<\/div>/i) || html.match(/class=["'][^"']*bxcl[^"']*["'][\s\S]*?<\/div>/i);
        const targetHtml = containerMatch ? containerMatch[0] : html;
        const liMatches = [...targetHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
        const chapters = [];
        const seenUrls = new Set();

        for (const li of liMatches) {
            const content = li[1];
            const aMatch = content.match(/<span class=["']lchx["']><a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a><\/span>/i) || content.match(/<a[^>]*href=["'](https:\/\/bacakomik\.my\/[^"']+-chapter-[^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
            if (!aMatch) continue;

            const chUrl = aMatch[1].trim();
            if (seenUrls.has(chUrl)) continue;
            seenUrls.add(chUrl);

            const rawTitle = cleanText(aMatch[2]);
            const dtMatch = content.match(/<span class=["']dt["'][^>]*>([\s\S]*?)<\/span>/i);
            const releaseDate = dtMatch ? cleanText(dtMatch[1]) : '';
            const numMatch = rawTitle.match(/chapter\s*([0-9.]+)/i) || chUrl.match(/chapter-([0-9.]+)/i);
            const chapterNumber = numMatch ? parseFloat(numMatch[1]) : null;

            chapters.push({ chapter_title: rawTitle, chapter_number: chapterNumber, chapter_url: chUrl, release_date: releaseDate });
        }
        return successResponse({ title, url: comicUrl, total_chapters: chapters.length, chapters });
    } catch (err) {
        return errorResponse(err.message);
    }
}

export async function getChapterImages(chapterUrlOrQuery, chapterNum = null) {
    try {
        let targetUrl = '';
        let comicName = '';
        const input = String(chapterUrlOrQuery || '').trim();

        if (!input) throw new Error('Judul atau URL chapter tidak boleh kosong.');

        if (input.startsWith('http') && !chapterNum) {
            targetUrl = input;
        } else {
            const comicRes = await getAllChapters(input);
            if (!comicRes.status || !comicRes.data || !comicRes.data.chapters || !comicRes.data.chapters.length) {
                throw new Error(`Tidak ada chapter ditemukan untuk: ${input}`);
            }

            comicName = comicRes.data.title;
            const chapters = comicRes.data.chapters;

            if (chapterNum !== null && chapterNum !== undefined) {
                const searchNum = parseFloat(chapterNum);
                const found = chapters.find(c => c.chapter_number === searchNum) || chapters.find(c => {
                    const reg = new RegExp(`chapter[- ]${chapterNum}(?:-|\\/|$)`, 'i');
                    return (reg.test(c.chapter_url) || reg.test(c.chapter_title));
                });

                if (!found) throw new Error(`Chapter ${chapterNum} tidak ditemukan pada komik ${comicName}.`);
                targetUrl = found.chapter_url;
            } else {
                targetUrl = chapters[0].chapter_url;
            }
        }

        const html = await fetchHtml(targetUrl);
        const rawH1Match = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
        const cleanedH1 = (rawH1Match ? cleanText(rawH1Match[1]) : '').replace(/^Komik\s+/i, '').trim();

        let chapterName = '';
        const chMatch = cleanedH1.match(/(Chapter\s*[0-9.]+.*)$/i);

        if (chMatch) {
            chapterName = chMatch[1].trim();
            if (!comicName) comicName = cleanedH1.substring(0, chMatch.index).trim();
        } else {
            chapterName = cleanedH1;
            if (!comicName) {
                const comicLinkMatch = html.match(/<a[^>]*href=["'](https:\/\/bacakomik\.my\/komik\/[^"']+)["']/i);
                if (comicLinkMatch) comicName = comicLinkMatch[1].split('/komik/')[1].replace(/\//g, '').replace(/-/g, ' ');
            }
        }

        const readerMatch = html.match(/id=["']anjay_ini_id_kh["'][\s\S]*?<\/div>/i) || html.match(/id=["']readerarea["'][\s\S]*?<\/div>/i);
        const readerHtml = readerMatch ? readerMatch[0] : html;
        const imgMatches = [...readerHtml.matchAll(/<img[^>]*>/gi)];
        const imageUrls = [];
        const seenUrls = new Set();

        for (const match of imgMatches) {
            const tag = match[0];
            let src = '';
            const lazyMatch = tag.match(/data-lazy-src=["']([^"']+)["']/i) || tag.match(/data-src=["']([^"']+)["']/i) || tag.match(/data-original=["']([^"']+)["']/i);

            if (lazyMatch) {
                src = lazyMatch[1].trim();
            } else {
                const srcMatch = tag.match(/src=["']([^"']+)["']/i);
                if (srcMatch) src = srcMatch[1].trim();
            }

            if (!src || src.startsWith('data:')) {
                const errMatch = tag.match(/this\.src=['"]([^'"]+)['"]/i);
                if (errMatch) src = errMatch[1].trim();
            }

            if (src && !src.startsWith('data:') && !seenUrls.has(src)) {
                const isSiteAsset = /logo|icon|ikon-hd|banner|avatar|wp-content\/uploads\/202/i.test(src);
                if (!isSiteAsset || src.includes('/data/')) {
                    seenUrls.add(src);
                    imageUrls.push(src);
                }
            }
        }
        return successResponse({ title: comicName, chapter: chapterName, url: targetUrl, image_url: imageUrls });
    } catch (err) {
        return errorResponse(err.message);
    }
}

// ==================== FORMATTERS ====================

function formatSearch(results) {
    if (!results?.length) return '❌ Komik tidak ditemukan.';
    return results.slice(0, 15).map((item, i) => [
        `*${i + 1}. ${item.title}*`,
        `├ Type: ${item.type || '-'}`,
        `├ Rating: ${item.rating || '-'}`,
        `├ Update: ${item.latest_chapter || '-'}`,
        `└ URL: ${item.url}`,
    ].join('\n')).join('\n\n');
}

function formatPopular(results) {
    if (!results?.length) return '❌ Data komik populer tidak ditemukan.';
    return results.map((item, i) => [
        `*${i + 1}. ${item.title}*`,
        `├ Type: ${item.type || '-'}`,
        `├ Rating: ${item.rating || '-'}`,
        `└ ${item.url}`,
    ].join('\n')).join('\n\n');
}

function formatChapters(data) {
    if (!data?.chapters?.length) return `❌ Tidak ada chapter ditemukan untuk *${data?.title || 'komik'}*.`;
    const chapters = data.chapters;
    let text = [`📚 *${data.title || 'Komik'}*`, `🔢 Total chapter: ${chapters.length}`, ''].join('\n');
    text += chapters.slice(0, 80).map((ch, i) => `${i + 1}. *${ch.chapter_title || `Chapter ${ch.chapter_number ?? '-'}`}*\n   ${ch.chapter_url}`).join('\n\n');
    if (chapters.length > 80) text += `\n\n_...dan ${chapters.length - 80} chapter lainnya._`;
    return text;
}

// ==================== MAIN HANDLER ====================

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const sub = (args[0] || 'help').toLowerCase();

        if (['help', 'menu', '?'].includes(sub) || args.length === 0 && !['populer', 'popular'].includes(sub)) {
            return await conn.sendMessage(m.chat, {
                text: [
                    '📚 *BacaKomik Scraper*',
                    '',
                    `• ${usedPrefix + command} cari <judul>`,
                    `• ${usedPrefix + command} populer [limit]`,
                    `• ${usedPrefix + command} chapters <judul/url>`,
                    `• ${usedPrefix + command} chapter <judul/url> <nomor>`,
                    `• ${usedPrefix + command} chapter <url-chapter>`,
                    '',
                    '*Contoh:*',
                    `${usedPrefix + command} cari solo leveling`,
                    `${usedPrefix + command} populer 10`,
                    `${usedPrefix + command} chapter solo leveling 1`
                ].join('\n')
            }, { quoted: m });
        }

        if (['cari', 'search'].includes(sub)) {
            const query = args.slice(1).join(' ').trim();
            if (!query) return m.reply(`❌ Masukkan judul komik.\nContoh: ${usedPrefix + command} cari solo leveling`);

            m.reply(`🔎 Mencari komik *${query}*...`);
            const res = await searchComic(query);
            if (!res.status) return m.reply(`❌ ${res.message}`);
            return m.reply(`🔎 *Hasil pencarian: ${query}*\n\n${formatSearch(res.data)}`);
        }

        if (['populer', 'popular', 'rekomendasi'].includes(sub)) {
            const limit = parseInt(args[1], 10) || 15;
            m.reply('📈 Mengambil komik populer...');
            const res = await getRekomendasi(limit);
            if (!res.status) return m.reply(`❌ ${res.message}`);
            return m.reply(`📈 *Komik Populer BacaKomik*\n\n${formatPopular(res.data)}`);
        }

        if (['chapters', 'chapterlist', 'listchapter'].includes(sub)) {
            const target = args.slice(1).join(' ').trim();
            if (!target) return m.reply(`❌ Masukkan judul atau URL komik.\nContoh: ${usedPrefix + command} chapters solo leveling`);

            m.reply('📖 Mengambil daftar chapter...');
            const res = await getAllChapters(target);
            if (!res.status) return m.reply(`❌ ${res.message}`);
            return m.reply(formatChapters(res.data));
        }

        if (['chapter', 'read', 'baca'].includes(sub)) {
            const commandArgs = args.slice(1);
            if (!commandArgs.length) {
                return m.reply(`❌ Masukkan URL chapter atau judul + nomor chapter.\nContoh:\n${usedPrefix + command} chapter solo leveling 1`);
            }

            let target = '';
            let chapterNum = null;

            if (commandArgs[0]?.startsWith('http')) {
                target = commandArgs[0];
            } else {
                chapterNum = commandArgs.length > 1 ? commandArgs.pop() : null;
                target = commandArgs.join(' ').trim();
            }

            m.reply('🖼️ Mengambil gambar chapter...');
            const res = await getChapterImages(target, chapterNum);
            if (!res.status) return m.reply(`❌ ${res.message}`);

            const images = res.data?.image_url || [];
            if (!images.length) return m.reply('❌ Tidak menemukan gambar pada chapter tersebut.');

            const MAX_IMAGES = 30;
            const sendImages = images.slice(0, MAX_IMAGES);

            await conn.sendMessage(m.chat, {
                text: [
                    `📖 *${res.data.title || 'Komik'}*`,
                    `📑 *${res.data.chapter || 'Chapter'}*`,
                    `🖼️ Total gambar: ${images.length}`,
                    '',
                    images.length > MAX_IMAGES ? `⚠️ Menampilkan ${MAX_IMAGES} gambar pertama.` : 'Mengirim halaman...'
                ].join('\n')
            }, { quoted: m });

            for (let i = 0; i < sendImages.length; i++) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: sendImages[i] },
                        caption: `📖 ${res.data.title || 'Komik'}\n📑 ${res.data.chapter || 'Chapter'}\n🖼️ Halaman ${i + 1}/${images.length}`
                    }, { quoted: m });
                } catch (err) {
                    console.error(`Gagal mengirim gambar ${i + 1}:`, err);
                }
            }
            return;
        }

        return m.reply(`❌ Subcommand *${sub}* tidak dikenal.\nGunakan ${usedPrefix + command} help untuk melihat penggunaan.`);
    } catch (err) {
        console.error('[BacaKomik]', err);
        return m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
};

handler.help = ['bacakomik', 'komik'];
handler.tags = ['anime'];
handler.command = /^(bacakomik|komik|komiksearch|komikpopuler)$/i;

export default handler;