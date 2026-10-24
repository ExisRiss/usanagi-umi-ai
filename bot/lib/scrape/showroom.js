/**
 * Zhuxin MD — Showroom Live scraper
 * API: https://www.showroom-live.com
 */
import axios from "axios";

const BASE = "https://www.showroom-live.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const client = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: {
    "User-Agent": UA,
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
    Referer: `${BASE}/`,
  },
});

/** Extract room_url_key from URL or plain key */
export function parseRoomKey(input) {
  const s = String(input || "").trim();
  if (!s) return null;
  // https://www.showroom-live.com/r/JKT48_Nayla
  let m = s.match(/showroom-live\.com\/r\/([A-Za-z0-9_-]+)/i);
  if (m) return m[1];
  // https://www.showroom-live.com/JKT48_Nayla (old style)
  m = s.match(/showroom-live\.com\/([A-Za-z0-9_-]+)(?:\?|$)/i);
  if (m && !["r", "api", "room", "user", "event"].includes(m[1].toLowerCase()))
    return m[1];
  if (/^[A-Za-z0-9_-]{2,80}$/.test(s)) return s;
  return null;
}

export function roomUrl(key) {
  return `${BASE}/r/${key}`;
}

function formatStarted(ts) {
  if (!ts) return null;
  const d = new Date(Number(ts) * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " WIB";
}

/**
 * Status room by room_url_key
 */
export async function getRoomStatus(roomUrlKey) {
  const key = parseRoomKey(roomUrlKey);
  if (!key) throw new Error("Room key / URL tidak valid");

  const { data } = await client.get("/api/room/status", {
    params: { room_url_key: key },
  });

  const roomId = data.room_id || data.roomId;
  let profile = null;
  if (roomId) {
    try {
      const res = await client.get("/api/room/profile", {
        params: { room_id: roomId },
      });
      profile = res.data;
    } catch {}
  }

  const isLive = !!(data.is_live || data.is_onlive || profile?.is_onlive);
  const viewers =
    profile?.view_num ??
    profile?.viewer_num ??
    data.view_num ??
    data.viewer_num ??
    null;

  return {
    roomUrlKey: data.room_url_key || key,
    roomId: roomId || null,
    roomName: data.room_name || profile?.room_name || profile?.main_name || key,
    isLive,
    liveId: data.live_id || profile?.live_id || 0,
    startedAt: data.started_at || profile?.current_live_started_at || null,
    startedText: formatStarted(
      data.started_at || profile?.current_live_started_at,
    ),
    viewers: viewers != null ? Number(viewers) : null,
    image:
      data.image_l ||
      data.image_m ||
      data.image_s ||
      profile?.image_l ||
      profile?.image_m ||
      profile?.image_s ||
      null,
    isOfficial: !!(data.is_official || profile?.is_official),
    follower: profile?.follower_num ?? null,
    url: roomUrl(data.room_url_key || key),
    raw: { status: data, profile },
  };
}

/**
 * Semua yang sedang live (flatten)
 */
export async function getOnlives() {
  const { data } = await client.get("/api/live/onlives");
  const list = [];
  for (const genre of data?.onlives || []) {
    for (const live of genre.lives || []) {
      list.push({
        genreId: genre.genre_id,
        genreName: genre.genre_name,
        roomUrlKey: live.room_url_key,
        roomId: live.room_id,
        roomName: live.room_name || live.main_name,
        viewers: live.view_num ?? live.viewer_num ?? 0,
        startedAt: live.started_at,
        startedText: formatStarted(live.started_at),
        image: live.image || live.image_m || live.image_s || null,
        telop: live.telop || null,
        url: roomUrl(live.room_url_key),
      });
    }
  }
  // dedupe by room key
  const seen = new Set();
  return list.filter((x) => {
    if (!x.roomUrlKey || seen.has(x.roomUrlKey)) return false;
    seen.add(x.roomUrlKey);
    return true;
  });
}

/** Cari live by keyword di nama / key */
export async function searchOnlives(query) {
  const q = String(query || "").toLowerCase().trim();
  const all = await getOnlives();
  if (!q) return all.slice(0, 30);
  return all
    .filter(
      (x) =>
        (x.roomName || "").toLowerCase().includes(q) ||
        (x.roomUrlKey || "").toLowerCase().includes(q),
    )
    .slice(0, 30);
}

export default {
  parseRoomKey,
  roomUrl,
  getRoomStatus,
  getOnlives,
  searchOnlives,
};
