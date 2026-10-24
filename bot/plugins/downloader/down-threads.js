import axios from "axios";
import cheerio from "cheerio";

function getThreadId(url) {
  let cleanUrl = url.split("?")[0].split("&")[0];

  if (cleanUrl.includes("/t/")) {
    cleanUrl = cleanUrl.split("/t/")[1];
  } else if (cleanUrl.includes("/post/")) {
    cleanUrl = cleanUrl.split("/post/")[1];
  }

  if (cleanUrl.endsWith("/")) {
    cleanUrl = cleanUrl.slice(0, -1);
  }

  return cleanUrl.split("/").pop();
}

function findPostObject(obj, targetCode) {
  if (!obj || typeof obj !== "object") return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findPostObject(item, targetCode);
      if (found) return found;
    }
  } else {
    if (obj.code === targetCode) return obj;

    for (const key in obj) {
      const found = findPostObject(obj[key], targetCode);
      if (found) return found;
    }
  }

  return null;
}

function getDurationFromUrl(videoUrl) {
  try {
    const urlObj = new URL(videoUrl);
    const efg = urlObj.searchParams.get("efg");

    if (efg) {
      const decoded = Buffer.from(efg, "base64").toString("utf-8");
      const data = JSON.parse(decoded);

      if (data?.duration_s) {
        return Math.round(data.duration_s) + "s";
      }
    }
  } catch {}

  return null;
}

function parseMedia(obj, list = [], seenUrls = new Set()) {
  if (!obj || typeof obj !== "object") return list;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      parseMedia(item, list, seenUrls);
    }
  } else {
    if (obj.video_versions && Array.isArray(obj.video_versions)) {
      const bestVideo = obj.video_versions[0];

      if (bestVideo?.url) {
        const cleanUrl = bestVideo.url
          .replace(/\\/g, "")
          .replace(/&amp;/g, "&");

        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);

          let duration =
            obj.video_duration
              ? Math.round(obj.video_duration) + "s"
              : obj.duration
              ? Math.round(obj.duration) + "s"
              : null;

          if (!duration) {
            duration = getDurationFromUrl(cleanUrl);
          }

          list.push({
            type: "video",
            width: obj.original_width || null,
            height: obj.original_height || null,
            resolution:
              obj.original_width && obj.original_height
                ? `${obj.original_width}x${obj.original_height}`
                : "Best Quality",
            duration,
            url: cleanUrl,
          });
        }
      }
    } else if (
      obj.image_versions2?.candidates &&
      Array.isArray(obj.image_versions2.candidates)
    ) {
      const bestImage = obj.image_versions2.candidates[0];

      if (bestImage?.url) {
        const cleanUrl = bestImage.url
          .replace(/\\/g, "")
          .replace(/&amp;/g, "&");

        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);

          list.push({
            type: "image",
            width: obj.original_width || bestImage.width || null,
            height: obj.original_height || bestImage.height || null,
            resolution:
              obj.original_width && obj.original_height
                ? `${obj.original_width}x${obj.original_height}`
                : bestImage.width && bestImage.height
                ? `${bestImage.width}x${bestImage.height}`
                : "Best Quality",
            url: cleanUrl,
          });
        }
      }
    }

    for (const key in obj) {
      if (
        key !== "video_versions" &&
        key !== "image_versions2" &&
        key !== "image_versions"
      ) {
        parseMedia(obj[key], list, seenUrls);
      }
    }
  }

  return list;
}

async function scrapeThreads(url) {
  const targetUrl = url.replace("threads.com", "threads.net");
  const code = getThreadId(targetUrl);

  const response = await axios.get(targetUrl, {
    headers: {
      "User-Agent":
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_voiced.html)",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  const $ = cheerio.load(response.data);

  let postObj = null;

  $('script[type="application/json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).text().trim());

      if (!postObj) {
        postObj = findPostObject(json, code);
      }
    } catch {}
  });

  const medias = [];
  const seen = new Set();

  if (postObj) {
    parseMedia(postObj, medias, seen);
  } else {
    $('script[type="application/json"]').each((_, el) => {
      try {
        parseMedia(JSON.parse($(el).text().trim()), medias, seen);
      } catch {}
    });
  }

  return {
    ok: medias.length > 0,
    code,
    url: targetUrl,
    medias,
  };
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply("Masukkan link Threads.\n\nContoh:\n.threads https://www.threads.net/@user/post/xxxxx");
  }

  try {
    await m.reply("⏳ Mengambil media Threads...");

    const result = await scrapeThreads(args[0]);

    if (!result.ok || result.medias.length === 0) {
      return m.reply("Media tidak ditemukan.");
    }

    const medias = result.medias;

    // JIKA MEDIA LEBIH DARI 1 (Kirim via Album)
    if (medias.length > 1) {
      if (typeof conn.sendAlbum === 'function') {
        const albumData = medias.map(media => {
          return media.type === "image"
            ? { type: 'image', data: { url: media.url }, caption: `🖼️ ${media.resolution}` }
            : { type: 'video', data: { url: media.url }, caption: `🎥 ${media.resolution}${media.duration ? ` • ${media.duration}` : ""}` };
        });
        
        await conn.sendAlbum(m.chat, albumData, { quoted: m });
      } else {
        // Fallback jika bot tidak memiliki fungsi sendAlbum
        for (const media of medias) {
          if (media.type === "image") {
            await conn.sendMessage(m.chat, { image: { url: media.url }, caption: `🖼️ ${media.resolution}` }, { quoted: m });
          } else {
            await conn.sendMessage(m.chat, { video: { url: media.url }, caption: `🎥 ${media.resolution}${media.duration ? ` • ${media.duration}` : ""}` }, { quoted: m });
          }
        }
      }
    } 
    // JIKA MEDIA CUMA 1 (Kirim Biasa)
    else {
      const media = medias[0];
      if (media.type === "image") {
        await conn.sendMessage(m.chat, {
          image: { url: media.url },
          caption: `🖼️ ${media.resolution}`,
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: media.url },
          caption: `🎥 ${media.resolution}${media.duration ? ` • ${media.duration}` : ""}`,
        }, { quoted: m });
      }
    }

  } catch (e) {
    console.error(e);
    m.reply("Terjadi kesalahan: " + e.message);
  }
};

handler.help = ["threads <url>"];
handler.tags = ["downloader"];
handler.command = /^threads(dl)?$/i;

export default handler;