/**
 * Zhuxin MD — Showroom Live cek + notif
 * Adapted for Bochiteam ESM Standard
 */
import {
  getRoomStatus,
  searchOnlives,
  parseRoomKey,
  roomUrl,
} from "../../lib/scrape/showroom.js";
import {
  addWatch,
  removeWatch,
  listWatch,
  buildLiveCaption,
  startShowroomWatcher,
} from "../../lib/usanagi-showroom-watch.js";

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const raw = (text || args.join(" ") || "").trim();
  const sub = (args[0] || "").toLowerCase();
  const chat = m.chat;

  try {
    startShowroomWatcher(conn);
  } catch {}

  if (!raw || sub === "help") {
    return m.reply(
      `🔴 *SHOWROOM LIVE*\n\n` +
        `*Cek status*\n` +
        `\`${usedPrefix}showroom <room_key|url>\`\n` +
        `Contoh: \`${usedPrefix}showroom JKT48_Nayla\`\n\n` +
        `*Cari yang lagi live*\n` +
        `\`${usedPrefix}showroom live\`\n` +
        `\`${usedPrefix}showroom live jkt48\`\n\n` +
        `*Notif otomatis (chat ini)*\n` +
        `\`${usedPrefix}showroom add <room_key>\`\n` +
        `\`${usedPrefix}showroom del <room_key>\`\n` +
        `\`${usedPrefix}showroom list\`\n\n` +
        `_Bot cek setiap ~2 menit. Notif hanya saat baru mulai live._`,
    );
  }

  if (sub === "list" || sub === "watchlist") {
    const list = listWatch(chat);
    if (!list.length) {
      return m.reply(
        `📋 *Watchlist kosong*\n\nTambah:\n\`${usedPrefix}showroom add JKT48_Nayla\``,
      );
    }
    const lines = list.map(
      (r, i) =>
        `*${i + 1}.${r.name || r.key}*\n` +
        `   Key: \`${r.key}\`\n` +
        `   Status: ${r.wasLive ? "🔴 LIVE" : "⚫ Offline"}`,
    );
    return m.reply(`📋 *SHOWROOM WATCHLIST*\n\n${lines.join("\n\n")}`);
  }

  if (sub === "add" || sub === "watch") {
    const keyIn = args.slice(1).join(" ");
    const key = parseRoomKey(keyIn);
    if (!key) {
      return m.reply(
        `❌ Masukkan room key / URL.\nContoh: \`${usedPrefix}showroom add JKT48_Nayla\``,
      );
    }
    
    // Fallback react in case m.react is not built-in in your base
    try { await m.react("🔍") } catch {}
    
    let name = key;
    try {
      const st = await getRoomStatus(key);
      name = st.roomName || key;
    } catch {}
    
    addWatch(chat, key, name);
    try { await m.react("✅") } catch {}
    
    return m.reply(
      `✅ *Ditambahkan ke watchlist*\n\n` +
        `• Room: *${name}*\n` +
        `• Key: \`${key}\`\n` +
        `• Link: ${roomUrl(key)}\n\n` +
        `Notif otomatis ke chat ini saat live.`,
    );
  }

  if (sub === "del" || sub === "remove" || sub === "hapus") {
    const key = parseRoomKey(args.slice(1).join(" "));
    if (!key) return m.reply(`❌ Contoh: \`${usedPrefix}showroom del JKT48_Nayla\``);
    const ok = removeWatch(chat, key);
    return m.reply(
      ok
        ? `✅ Dihapus dari watchlist: \`${key}\``
        : `❌ \`${key}\` tidak ada di watchlist chat ini.`,
    );
  }

  if (sub === "live" || sub === "onlive" || sub === "search") {
    const q = args.slice(1).join(" ");
    try { await m.react("🔍") } catch {}
    try {
      const lives = await searchOnlives(q);
      if (!lives.length) {
        try { await m.react("❌") } catch {}
        return m.reply(
          q
            ? `❌ Tidak ada yang live cocok *${q}*`
            : `❌ Tidak ada data live saat ini.`,
        );
      }
      const top = lives
        .sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
        .slice(0, 12);
      const body = top
        .map(
          (l, i) =>
            `*${i + 1}.${l.roomName || l.roomUrlKey}*\n` +
            `   👥 ${Number(l.viewers || 0).toLocaleString("id-ID")}` +
            (l.genreName ? ` · ${l.genreName}` : "") +
            `\n   \`${l.roomUrlKey}\`\n` +
            `   ${l.url}`,
        )
        .join("\n\n");
      try { await m.react("✅") } catch {}
      return m.reply(
        `🔴 *SHOWROOM ON LIVE*` +
          (q ? ` — _${q}_` : "") +
          `\n\n${body}\n\n` +
          `Notif: \`${usedPrefix}showroom add <key>\``,
      );
    } catch (e) {
      try { await m.react("❌") } catch {}
      return m.reply(`❌ Gagal ambil onlive: ${e.message}`);
    }
  }

  const key = parseRoomKey(raw);
  if (!key) {
    return m.reply(
      `❌ Room key / URL tidak valid.\nKetik \`${usedPrefix}showroom help\``,
    );
  }

  try { await m.react("🔍") } catch {}
  try {
    const info = await getRoomStatus(key);
    const caption = info.isLive
      ? buildLiveCaption(info)
      : `⚫ *OFFLINE*\n\n` +
        `*${info.roomName}*\n` +
        `Key: \`${info.roomUrlKey}\`\n` +
        (info.follower != null
          ? `Followers: *${Number(info.follower).toLocaleString("id-ID")}*\n`
          : "") +
        `\n🔗 ${info.url}\n\n` +
        `Pantau otomatis:\n\`${usedPrefix}showroom add ${info.roomUrlKey}\``;

    if (info.image) {
      try {
        await conn.sendMessage(
          chat,
          { image: { url: info.image }, caption },
          { quoted: m },
        );
      } catch {
        await m.reply(caption);
      }
    } else {
      await m.reply(caption);
    }
    try { await m.react(info.isLive ? "🔴" : "✅") } catch {}
  } catch (e) {
    console.error("[showroom]", e);
    try { await m.react("❌") } catch {}
    return m.reply(`❌ Gagal cek room: ${e.message}`);
  }
};

handler.help = ['showroom <key|url>', 'showroom live', 'showroom add', 'showroom del', 'showroom list'];
handler.tags = ['info'];
handler.command = /^(showroom|srlive|showroomlive|srnotif)$/i;

handler.admin = true;

export default handler;