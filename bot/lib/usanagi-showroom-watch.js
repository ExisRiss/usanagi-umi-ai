/**
 * Zhuxin MD — Showroom live watcher (auto notif)
  * By AlzRiss - Usanagi Umi AI
 */
import fs from "fs";
import path from "path";
import {
  getRoomStatus,
  getOnlives,
  parseRoomKey,
} from "../lib/scrape/showroom.js";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const STATE_FILE = path.join(DATA_DIR, "showroom_watch.json");

const DEFAULT_STATE = {
  enabled: true,
  intervalMin: 2,
  /** roomKey -> { name, chats: string[], lastLiveId, wasLive } */
  rooms: {},
};

function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return structuredClone(DEFAULT_STATE);
    return { ...DEFAULT_STATE, ...JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error("[showroom-watch] save", e.message);
  }
}

export function listWatch(chatId) {
  const st = loadState();
  const out = [];
  for (const [key, info] of Object.entries(st.rooms || {})) {
    if (!chatId || (info.chats || []).includes(String(chatId))) {
      out.push({ key, ...info });
    }
  }
  return out;
}

export function addWatch(chatId, roomKey, roomName = null) {
  const key = parseRoomKey(roomKey);
  if (!key) throw new Error("Room key tidak valid");
  const st = loadState();
  if (!st.rooms[key]) {
    st.rooms[key] = {
      name: roomName || key,
      chats: [],
      lastLiveId: 0,
      wasLive: false,
    };
  }
  const cid = String(chatId);
  if (!st.rooms[key].chats.includes(cid)) st.rooms[key].chats.push(cid);
  if (roomName) st.rooms[key].name = roomName;
  saveState(st);
  return st.rooms[key];
}

export function removeWatch(chatId, roomKey) {
  const key = parseRoomKey(roomKey);
  if (!key) throw new Error("Room key tidak valid");
  const st = loadState();
  if (!st.rooms[key]) return false;
  st.rooms[key].chats = (st.rooms[key].chats || []).filter(
    (c) => c !== String(chatId),
  );
  if (!st.rooms[key].chats.length) delete st.rooms[key];
  saveState(st);
  return true;
}

function formatViewers(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return Number(n).toLocaleString("id-ID");
}

export function buildLiveCaption(info) {
  return (
    `🔴 *SHOWROOM LIVE*\n\n` +
    `*${info.roomName || info.roomUrlKey}*\n` +
    `sedang LIVE (SHOWROOM)!\n\n` +
    `👥 Penonton: *${formatViewers(info.viewers)}*\n` +
    (info.startedText ? `📅 ${info.startedText}\n` : "") +
    `\n🔗 ${info.url}`
  );
}

let timer = null;
let running = false;

/**
 * Start background poller
 * @param {object} sock - Baileys socket
 * @param {object} opts
 */
export function startShowroomWatcher(sock, opts = {}) {
  if (timer) return;
  const st0 = loadState();
  const intervalMs = Math.max(
    60_000,
    (Number(opts.intervalMin || st0.intervalMin) || 2) * 60_000,
  );

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const st = loadState();
      if (st.enabled === false) return;
      const keys = Object.keys(st.rooms || {});
      if (!keys.length) return;

      // batch via onlives for speed when many rooms
      let onliveMap = null;
      try {
        const lives = await getOnlives();
        onliveMap = new Map(lives.map((l) => [l.roomUrlKey, l]));
      } catch (e) {
        console.error("[showroom-watch] onlives", e.message);
      }

      for (const key of keys) {
        const info = st.rooms[key];
        if (!info?.chats?.length) continue;

        let status;
        try {
          if (onliveMap?.has(key)) {
            const live = onliveMap.get(key);
            status = {
              roomUrlKey: key,
              roomName: live.roomName || info.name || key,
              isLive: true,
              liveId: live.liveId || live.startedAt || 1,
              viewers: live.viewers,
              startedText: live.startedText,
              image: live.image,
              url: live.url,
            };
          } else if (onliveMap) {
            status = {
              roomUrlKey: key,
              roomName: info.name || key,
              isLive: false,
              liveId: 0,
              url: `https://www.showroom-live.com/r/${key}`,
            };
          } else {
            status = await getRoomStatus(key);
          }
        } catch (e) {
          console.error("[showroom-watch] room", key, e.message);
          continue;
        }

        const wasLive = !!info.wasLive;
        const isLive = !!status.isLive;
        const liveId = status.liveId || 0;

        // notif hanya saat baru mulai live (transition offline→online atau liveId baru)
        if (isLive && (!wasLive || (liveId && liveId !== info.lastLiveId))) {
          const caption = buildLiveCaption({
            ...status,
            roomName: status.roomName || info.name,
          });
          for (const chat of info.chats) {
            try {
              if (status.image) {
                await sock.sendMessage(chat, {
                  image: { url: status.image },
                  caption,
                });
              } else {
                await sock.sendMessage(chat, { text: caption });
              }
            } catch (e) {
              console.error("[showroom-watch] send", chat, e.message);
            }
          }
          info.lastLiveId = liveId || Date.now();
          info.name = status.roomName || info.name;
        }

        info.wasLive = isLive;
        if (status.roomName) info.name = status.roomName;
        st.rooms[key] = info;
      }
      saveState(st);
    } catch (e) {
      console.error("[showroom-watch] tick", e.message);
    } finally {
      running = false;
    }
  };

  timer = setInterval(tick, intervalMs);
  // first run after 15s
  setTimeout(tick, 15_000);
  console.log(
    `[showroom-watch] started · interval ${Math.round(intervalMs / 60000)}m`,
  );
  return timer;
}

export function stopShowroomWatcher() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export { loadState, saveState };
