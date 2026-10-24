/**
 * =============================================================
 *  NAME       : Omnify AIO Scraper / Downloader (Auto-Send Media)
  * By AlzRiss - Usanagi Umi AI
 * =============================================================
 */

const API_BASE = 'https://api-aio.omnifylabs.sbs';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Origin': 'https://aio.omnifylabs.sbs',
  'Referer': 'https://aio.omnifylabs.sbs/',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  if (clean.startsWith('http://') && !clean.includes('localhost') && !clean.includes('127.0.0.1')) {
    clean = clean.replace(/^http:\/\//i, 'https://');
  }
  return clean;
}

function sanitizeData(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    return normalizeUrl(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  if (typeof data === 'object') {
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = sanitizeData(data[key]);
    }
    return result;
  }
  return data;
}

async function resolveMedia(mediaUrl, options = {}) {
  const targetUrl = typeof mediaUrl === 'string' ? mediaUrl.trim() : '';
  if (!targetUrl) throw new Error('URL media tidak boleh kosong.');

  const payload = { url: targetUrl };

  if (options.password && typeof options.password === 'string') {
    payload.password = options.password.trim();
  }

  const response = await fetch(`${API_BASE}/api/v1/media/resolve`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload)
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || json?.status === 'error') {
    const msg = json?.message || `HTTP error dari Omnify AIO! Status: ${response.status}`;
    throw new Error(msg);
  }

  const rawData = json?.data || {};
  const cleanedData = sanitizeData(rawData);

  return {
    status: true,
    platform: json?.platform || cleanedData?.platform || 'unknown',
    data: cleanedData
  };
}

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Masukkan URL media yang ingin di-download!\n\nContoh: *${usedPrefix + command} https://www.tiktok.com/@wa_one0808/video/7677636790370438407*`);
  }

  try {
    m.reply('⏳ _Sedang mengunduh media, tunggu sebentar..._');

    let options = {};
    let targetUrl = text;
    
    if (args.length > 1) {
      targetUrl = args[0];
      options.password = args[1];
    }

    const res = await resolveMedia(targetUrl, options);
    
    if (!res.status || !res.data) {
      return m.reply('❌ Gagal mengambil data media.');
    }

    const { data, platform } = res;
    
    // Siapkan caption
    let caption = `*O M N I F Y - ${platform.toUpperCase()}*\n\n`;
    if (data.author?.nickname) caption += `◦ *Author:* ${data.author.nickname} (@${data.author.uniqueId || ''})\n`;
    if (data.description) caption += `◦ *Desc:* ${data.description.substring(0, 50)}...\n`;
    
    if (data.stats) {
      caption += `◦ *Likes:* ${data.stats.likeCount || 0} | *Plays:* ${data.stats.playCount || 0}\n`;
    }

    // --- LOGIKA MENGIRIM MEDIA ---
    
    // 1. Jika tipe media adalah 'video' dan ada videoUrl atau di dalam formats ada video
    if (data.type === 'video' || data.videoUrl || (data.formats && data.formats.some(f => f.type === 'video'))) {
        
        let targetVideo = data.hdVideoUrl || data.videoUrl;
        
        // Cari dari formats kalau URL utama tidak ada (pilih tanpa watermark jika bisa)
        if (!targetVideo && data.formats) {
            let formatVideo = data.formats.find(f => f.type === 'video' && !f.hasWatermark) || data.formats.find(f => f.type === 'video');
            if (formatVideo) targetVideo = formatVideo.url;
        }

        if (targetVideo) {
            await conn.sendMessage(m.chat, { video: { url: targetVideo }, caption: caption }, { quoted: m });
        } else {
            m.reply("❌ URL Video tidak ditemukan.");
        }

    // 2. Jika tipe media adalah 'image' atau 'images' (carousel/slide)
    } else if (data.type === 'image' || (data.images && data.images.length > 0)) {
        if (data.images && data.images.length > 0) {
            // Jika ada banyak gambar (misal slide TikTok/IG)
            for (let i = 0; i < data.images.length; i++) {
                // Hanya kirim caption di gambar pertama
                await conn.sendMessage(m.chat, { image: { url: data.images[i] }, caption: i === 0 ? caption : '' }, { quoted: m });
            }
        } else if (data.url) { // Gambar tunggal
            await conn.sendMessage(m.chat, { image: { url: data.url }, caption: caption }, { quoted: m });
        } else {
             m.reply("❌ URL Gambar tidak ditemukan.");
        }

    // 3. Jika tipe media adalah 'audio' (Spotify, SoundCloud, atau audio only)
    } else if (data.type === 'audio' || data.audioUrl || (data.formats && data.formats.some(f => f.type === 'audio'))) {
        
        let targetAudio = data.audioUrl;
        if (!targetAudio && data.formats) {
            let formatAudio = data.formats.find(f => f.type === 'audio');
            if (formatAudio) targetAudio = formatAudio.url;
        }

        if (targetAudio) {
            // Kirim gambar cover / thumbnail dulu jika ada (karena audio tidak punya caption visual yang sama spt gambar)
            if (data.cover) {
                await conn.sendMessage(m.chat, { image: { url: data.cover }, caption: caption }, { quoted: m });
            } else {
                await m.reply(caption); 
            }
            // Lalu kirim audionya
            await conn.sendMessage(m.chat, { audio: { url: targetAudio }, mimetype: 'audio/mpeg' }, { quoted: m });
        } else {
             m.reply("❌ URL Audio tidak ditemukan.");
        }
        
    } else {
        // Fallback jika tipe tidak dikenali tapi sukses (tampilkan JSON agar tahu strukturnya)
        m.reply(`❌ Tipe media (${data.type}) belum di-support untuk kirim otomatis.\n\n*Result Data:*\n${JSON.stringify(data, null, 2)}`);
    }

  } catch (err) {
    m.reply(`❌ *Terjadi Kesalahan:*\n${err.message}`);
  }
}

handler.help = ['omnify <url>', 'aio <url>']
handler.tags = ['downloader']
handler.command = /^(omnify|aio)$/i

export default handler