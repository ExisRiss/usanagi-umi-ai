
import * as cheerio from "cheerio";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import path from "path";
import os from "os";

// ================== CLASS SCRAPER ================== //
class MyInstants {
  static DEFAULT_USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36";

  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "https://www.myinstants.com";
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.maxRetries = options.maxRetries ?? 3;
    this.delayMs = options.delayMs ?? 1500;
    this.headers = {
      "User-Agent": options.userAgent || MyInstants.DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      Referer: `${this.baseUrl}/`,
    };
  }

  _sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
  _absUrl(url) { try { return url ? new URL(url, this.baseUrl).toString() : null; } catch { return null; } }
  _cleanText(text) { return String(text || "").replace(/\s+/g, " ").trim(); }
  _safeFileName(name) { return String(name || "audio.mp3").split("/").pop().replace(/[^a-zA-Z0-9_.-]+/g, "_").slice(0, 180) || "audio.mp3"; }

  _extractAudioPath(onclick = "") {
    const match = String(onclick).match(/play\(\s*['"]([^'"]+)['"]/);
    return match?.[1] || null;
  }
  _extractSlug(onclick = "") {
    const match = String(onclick).match(/play\(\s*['"][^'"]+['"]\s*,\s*['"][^'"]*['"]\s*,\s*['"]([^'"]+)['"]\s*\)/);
    return match?.[1] || null;
  }

  async _fetch(url, options = {}) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(url, { ...options, headers: { ...this.headers, ...(options.headers || {}) }, signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok && attempt === this.maxRetries) throw new Error(`HTTP ${response.status}`);
        if (response.ok) return response;
      } catch (error) {
        clearTimeout(timer);
        if (attempt === this.maxRetries) throw error;
        await this._sleep(this.delayMs * attempt);
      }
    }
  }

  buildUrl(pathname, params = {}) {
    const url = new URL(pathname.startsWith("/") ? pathname : `/${pathname}`, this.baseUrl);
    for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, String(value));
    return url.toString();
  }

  parseInstantList(html) {
    const $ = cheerio.load(html);
    const items = [];
    $(".instant").each((index, element) => {
      const link = $(element).find("a.instant-link");
      const button = $(element).find("button.small-button");
      const onclick = button.attr("onclick") || "";
      const href = link.attr("href") || "";
      const title = this._cleanText(link.text() || button.attr("title")?.replace(/^Play\s+/i, "").replace(/\s+sound$/i, "") || "");
      const audioPath = this._extractAudioPath(onclick);
      const slug = this._extractSlug(onclick) || href.split("/").filter(Boolean).pop() || null;
      items.push({ position: index + 1, title, slug, mp3Url: audioPath ? this._absUrl(audioPath) : null });
    });
    return items;
  }

  async searchAll(query, { maxPages = 1, limit = 10 } = {}) {
    const results = [];
    for (let page = 1; page <= maxPages; page++) {
      const url = this.buildUrl("/en/search/", { name: query, ...(page > 1 ? { page } : {}) });
      const html = await (await this._fetch(url)).text();
      const items = this.parseInstantList(html);
      if (!items.length) break;
      results.push(...items);
      if (results.length >= limit) return results.slice(0, limit);
      if (page < maxPages) await this._sleep(this.delayMs);
    }
    return results;
  }

  async getInstantDetail(slug) {
    const url = this.buildUrl(`/en/instant/${slug}/`);
    const html = await (await this._fetch(url)).text();
    const $ = cheerio.load(html);
    let mp3Url = html.match(/var\s+preloadAudioUrl\s*=\s*['"]([^'"]+)['"]/)?.[1] || this._extractAudioPath($("#instant-page-button-element").attr("onclick") || "");
    mp3Url = mp3Url ? this._absUrl(mp3Url) : null;
    return { title: this._cleanText($("#instant-page-title").first().text()), mp3Url, mp3Filename: mp3Url ? this._safeFileName(mp3Url) : null };
  }

  async downloadBySlug(slug, outputDir = "./downloads") {
    const detail = await this.getInstantDetail(slug);
    if (!detail.mp3Url) throw new Error(`MP3 tidak ditemukan untuk: ${slug}`);
    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, detail.mp3Filename);
    const response = await this._fetch(detail.mp3Url);
    await pipeline(Readable.fromWeb(response.body), createWriteStream(filePath));
    return { ...detail, filePath };
  }
}

// ================== HANDLER BOT ================== //

// Tempat menyimpan hasil pencarian sementara berdasarkan nomor pengirim
const searchSession = new Map();

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) {
    return m.reply(`*Panduan Penggunaan MyInstants*\n\n1. Cari sound:\n*${usedPrefix + command} search <query>*\nContoh: *${usedPrefix + command} search vine boom*\n\n2. Putar dari nomor hasil pencarian:\n*${usedPrefix + command} play <nomor>*\nContoh: *${usedPrefix + command} play 1*`);
  }

  const action = args[0].toLowerCase();
  const query = args.slice(1).join(" ");
  const scraper = new MyInstants();

  if (action === "search") {
    if (!query) return m.reply(`Masukkan judul sound yang ingin dicari!\nContoh: *${usedPrefix + command} search vine boom*`);
    
    await m.reply("Mencari sound...");
    try {
      // Ambil top 10 pencarian
      const results = await scraper.searchAll(query, { maxPages: 1, limit: 10 });
      if (!results.length) return m.reply("Sound tidak ditemukan.");

      // Simpan hasil ke session memory berdasarkan nomor WA pengirim (m.sender)
      searchSession.set(m.sender, results);

      let txt = `*MYINSTANTS SEARCH RESULTS*\n_Pencarian: ${query}_\n\n`;
      results.forEach((res, i) => {
        txt += `*${i + 1}.* ${res.title}\n`;
      });
      txt += `\nKetik *${usedPrefix + command} play <nomor>* untuk mengunduh audio.\nContoh: *${usedPrefix + command} play 1*`;
      
      return m.reply(txt);
    } catch (e) {
      return m.reply(`Terjadi kesalahan saat mencari: ${e.message}`);
    }

  } else if (action === "play") {
    if (!query) return m.reply(`Masukkan nomor urut sound yang ingin diputar!\nContoh: *${usedPrefix + command} play 1*`);
    
    let targetSlug = query;

    // Cek apakah user menginput angka (nomor urut)
    if (!isNaN(query)) {
      const index = parseInt(query) - 1;
      const userSession = searchSession.get(m.sender);

      if (!userSession) {
        return m.reply(`Kamu belum melakukan pencarian atau sesi telah kedaluwarsa.\nSilakan cari lagi dengan *${usedPrefix + command} search <query>*`);
      }
      if (!userSession[index]) {
        return m.reply(`Nomor *${query}* tidak ada dalam daftar pencarianmu. Masukkan nomor yang benar.`);
      }
      targetSlug = userSession[index].slug;
    }

    await m.reply("Mengunduh sound...");
    try {
      const tmpDir = os.tmpdir();
      const downloaded = await scraper.downloadBySlug(targetSlug, tmpDir);

      // Kirim audio
      await conn.sendMessage(m.chat, { 
        audio: { url: downloaded.filePath }, 
        mimetype: 'audio/mpeg', 
        ptt: false // Ganti jadi true jika ingin dikirim berbentuk Voice Note
      }, { quoted: m });

      // Hapus file dari penyimpanan temporer
      await fs.unlink(downloaded.filePath).catch(() => {});
      
    } catch (e) {
      return m.reply(`Gagal memutar sound: ${e.message}`);
    }

  } else {
    return m.reply(`Aksi tidak dikenali! Gunakan *search* atau *play*.`);
  }
};

handler.help = ["myinstants search <query>", "myinstants play <nomor>"];
handler.tags = ["downloader", "search"];
handler.command = /^(myinstants|sound|instants)$/i;

export default handler;