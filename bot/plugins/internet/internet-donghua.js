/* By AlzRiss - Usanagi Umi AI */

import axios from "axios"
import * as cheerio from "cheerio"

async function donghua(search) {
  const { data: html } = await axios.get("https://donghuafilm.com/", {
    params: { s: search },
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  })

  const $ = cheerio.load(html)
  let result = []

  $("article.bs").each((i, v) => {
    const $article = $(v)
    const $link = $article.find('a[itemprop="url"]')

    const sigma = {
      title: $link.attr("title") || "",
      url: $link.attr("href") || "",
      image:
        $article.find("img").attr("data-src") ||
        $article.find("img").attr("data-lazy-src") ||
        $article.find("img").attr("data-original") ||
        $article.find("img").attr("src") ||
        "",
      type: $article.find(".typez").text().trim() || "",
      status: $article.find(".status, .epx").first().text().trim() || "",
      isHot: $article.find(".hotbadge").length > 0,
      subDub: $article.find(".sb").text().trim() || "",
      displayTitle:
        $article.find(".tt").contents().first().text().trim() ||
        $article.find('h2[itemprop="headline"]').text().trim(),
    }

    result.push(sigma)
  })

  return result
}

async function detail(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  })

  const $ = cheerio.load(html)

  const getImageSrc = (selector) => {
    const $img = $(selector)
    return $img.attr("data-src") || $img.attr("src") || ""
  }

  const description =
    $(".desc").text().trim() ||
    $(".info-content .desc").text().trim() ||
    $(".ninfo .desc").text().trim() ||
    $(".infox .desc").text().trim()

  const details = {
    title: $(".entry-title").text().trim(),
    description,
    coverImage: getImageSrc(".bigcover img"),
    thumbnail: getImageSrc(".thumb img"),
    status: $('span:contains("Status:")').next().text().trim(),
    network: $('span:contains("Network:") a').text().trim(),
    studio: $('span:contains("Studio:") a').text().trim(),
    duration: $('span:contains("Duration:")')
      .text()
      .replace("Duration:", "")
      .trim(),
    country: $('span:contains("Country:") a').text().trim(),
    type: $('span:contains("Type:")').text().replace("Type:", "").trim(),
    fansub: $('span:contains("Fansub:")').text().replace("Fansub:", "").trim(),
    censor: $('span:contains("Censor:")').text().replace("Censor:", "").trim(),
    postedBy: $(".author .fn").text().trim(),
    releasedDate: $('time[itemprop="datePublished"]').text().trim(),
    updatedDate: $('time[itemprop="dateModified"]').text().trim(),
    genres: [],
    synopsis: $(".entry-content p").text().trim(),
    episodes: [],
  }

  $(".genxed a").each((i, v) => {
    details.genres.push($(v).text().trim())
  })

  $(".eplister li").each((i, v) => {
    const episode = {
      number: $(v).find(".epl-num").text().trim(),
      title: $(v).find(".epl-title").text().trim(),
      subtitleType: $(v).find(".epl-sub .status").text().trim(),
      date: $(v).find(".epl-date").text().trim(),
      url: $(v).find("a").attr("href") || "",
    }
    details.episodes.push(episode)
  })

  return details
}

let handler = async (m, { text, command, conn }) => {
  if (!text) {
    return m.reply(
      `❗ Contoh penggunaan:\n` +
      `.donghua soul\n` +
      `.donghuadetail https://donghuafilm.com/anime/xxxxx/`
    )
  }

  try {
    if (command === "donghua") {
      const res = await donghua(text)
      if (!res.length) return m.reply("❌ Data tidak ditemukan.")

      let caption = `🔎 *HASIL PENCARIAN DONGHUA*\n\n`

      res.slice(0, 10).forEach((v, i) => {
        caption +=
          `*${i + 1}. ${v.displayTitle || v.title}*\n` +
          `📺 Type: ${v.type || "-"}\n` +
          `📌 Status: ${v.status || "-"}\n` +
          `🔥 Hot: ${v.isHot ? "Yes" : "No"}\n` +
          `🎬 Sub/Dub: ${v.subDub || "-"}\n` +
          `🔗 URL: ${v.url}\n\n`
      })

      caption += `Ketik:\n.donghuadetail <url> untuk melihat detail.`

      return m.reply(caption.trim())
    }

    if (command === "donghuadetail") {
      const data = await detail(text)

      let caption =
        `🎥 *${data.title}*\n\n` +
        `📝 Deskripsi:\n${data.description || data.synopsis || "-"}\n\n` +
        `📌 Status: ${data.status || "-"}\n` +
        `🏷 Type: ${data.type || "-"}\n` +
        `🎞 Studio: ${data.studio || "-"}\n` +
        `🌍 Country: ${data.country || "-"}\n` +
        `⏱ Duration: ${data.duration || "-"}\n` +
        `📡 Network: ${data.network || "-"}\n` +
        `🎭 Genre: ${data.genres.join(", ") || "-"}\n` +
        `📅 Release: ${data.releasedDate || "-"}\n` +
        `🔄 Update: ${data.updatedDate || "-"}\n\n`

      if (data.episodes.length) {
        caption += `📺 *EPISODES (${data.episodes.length})*\n\n`
        data.episodes.slice(0, 15).forEach((ep, i) => {
          caption +=
            `${i + 1}. ${ep.number} - ${ep.title}\n` +
            `🗓 ${ep.date}\n` +
            `🎬 ${ep.subtitleType}\n` +
            `🔗 ${ep.url}\n\n`
        })
      }

      if (data.thumbnail) {
        return conn.sendMessage(
          m.chat,
          { image: { url: data.thumbnail }, caption },
          { quoted: m }
        )
      } else {
        return m.reply(caption.trim())
      }
    }
  } catch (e) {
    console.error(e)
    return m.reply("❌ Terjadi error saat mengambil data.")
  }
}

handler.help = ["donghua", "donghuadetail"]
handler.tags = ["internet"]
handler.command = ["donghua", "donghuadetail"]
handler.limit = true
handler.register = true

export default handler