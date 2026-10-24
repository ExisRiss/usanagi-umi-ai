/* By AlzRiss - Usanagi Umi AI */
/*
╔══════════════════════════════════════════════╗
║        ⚡  𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫  ⚡                     ║
╚══════════════════════════════════════════════╝

╭───────────「 ✦ 𝑰𝑵𝑭𝑶 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 ✦ 」───────────╮
│ 👤 Developer : 𝑨𝒍𝒛𝑹𝒊𝒔𝒔
│ 📢 Saluran   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
│ ⚙️ Engine    : Baileys Multi-Device
╰──────────────────────────────────────────────╯

              「 ⚡ 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫 ⚡ 」
*/

export const FEATURE_CREDIT = 'By AlzRiss - Usanagi Umi AI';


import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';

class Uptodown {
    constructor(text) {
        this.baseUrl = "https://id.uptodown.com";
        this.text = text;
    }

    async search() {
        return axios.post(this.baseUrl + "/android/search", { q: this.text }).then((response) => {
            const $ = load(response.data);
            let result = [];
            $('.content .name a').each((_, a) => {
                let _slug = $(a).attr('href');
                let _name = $(a).text().trim();
                result.push({
                    name: _name,
                    slug: _slug.replace("." + this.baseUrl.replace("https://", "") + "/android", "").replace("https://", "")
                });
            });
            return result;
        }).catch((e) => {
            console.error(e);
            throw e;
        });
    }

    async download() {
        return axios.get("https://" + this.text + "." + this.baseUrl.replace("https://", "") + "/android").then(async (response) => {
            const $ = load(response.data);
            let image = [];
            let obj = {};
            let v = $('.detail .icon img');
            obj.title = v.attr('alt').replace("Ikon ", "") || "None";
            let slug = $('a.button.last').attr('href');
            obj.version = $('.info .version').text().trim() || "None";
            const downloadData = await this.getDownloadData(slug, obj.version);
            obj.download = downloadData || "None";
            obj.author = $('.autor').text().trim() || "None";
            obj.score = $('span[id="rating-inner-text"]').text().trim() || "None";
            obj.unduhan = $('.dwstat').text().trim() || "None";
            obj.icon = v.attr('src') || "None";
            $('.gallery picture img').each((_, a) => {
                image.push($(a).attr('src'));
            });
            obj.image = image || [];
            obj.desc = $('.text-description').text().trim().split('\n')[0] || "None";
            return obj;
        }).catch((e) => {
            console.error(e);
            throw e;
        });
    }

    async getDownloadData(slug, version) {
        try {
            const response = await axios.get(slug);
            const downloadUrl = `https://dw.uptodown.net/dwn/${load(response.data)('.button-group.download button').attr('data-url')}${version}.apk`;
            const { headers } = await axios.head(downloadUrl);
            const downloadSize = headers["content-length"];
            return { size: downloadSize, url: downloadUrl };
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}


const pluginConfig = {
  name: "uptodown",
  alias: [],
  category: "search",
  description: "Imported from Usanagi Umi AI V4.6",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return m.reply("Masukkan nama aplikasi untuk mencari.");
    }

    const query = args.join(" ");
    const uptodown = new Uptodown(query);

    try {
        const results = await uptodown.search();
        if (results.length === 0) {
            return m.reply("Aplikasi tidak ditemukan.");
        }

        const app = results[0];
        uptodown.text = app.slug;

        const details = await uptodown.download();
        
        const message = `
*Title:* ${details.title}
*Version:* ${details.version}
*Author:* ${details.author}
*Score:* ${details.score}
*Unduhan:* ${details.unduhan}
*Deskripsi:* ${details.desc}

*Download:* ${details.download.url} (Size: ${details.download.size} bytes)
        `.trim();

        const iconBuffer = await axios.get(details.icon, { responseType: 'arraybuffer' }).then(res => res.data);
        await conn.sendMessage(m.chat, { image: Buffer.from(iconBuffer), caption: message }, { quoted: m });

        for (const img of details.image) {
            const imgBuffer = await axios.get(img, { responseType: 'arraybuffer' }).then(res => res.data);
            await conn.sendMessage(m.chat, { image: Buffer.from(imgBuffer) }, { quoted: m });
        }
        
        const apkBuffer = await axios.get(details.download.url, { responseType: 'arraybuffer' }).then(res => res.data);
        const fileName = `${details.title}-${details.version}.apk`;
        const filePath = path.join('/tmp', fileName);
        fs.writeFileSync(filePath, apkBuffer);

        await conn.sendMessage(m.chat, { document: { url: filePath }, mimetype: 'application/vnd.android.package-archive', fileName }, { quoted: m });
        
        fs.unlinkSync(filePath);

    } catch (e) {
        console.error(e);
        m.reply("Terjadi kesalahan saat mengambil data.");
    }
};

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["uptodown"]
const __umiOriginalHandler = handler
const __umiHandler = async function (m, context = {}) {
  const adapted = Object.create(m)
  Object.defineProperties(adapted, {
    text: { value: String(context.text || ''), writable: true, configurable: true },
    args: { value: context.args || [], writable: true, configurable: true },
    command: { value: String(context.command || '').toLowerCase(), writable: true, configurable: true },
    prefix: { value: context.usedPrefix || '.', writable: true, configurable: true },
    isOwner: { value: Boolean(context.isOwner), writable: true, configurable: true },
    isPremium: { value: Boolean(context.isPrems), writable: true, configurable: true },
    isAdmin: { value: Boolean(context.isAdmin), writable: true, configurable: true },
    isBotAdmin: { value: Boolean(context.isBotAdmin), writable: true, configurable: true }
  })
  return __umiOriginalHandler.call(this, adapted, {
    ...context,
    sock: context.conn,
    conn: context.conn,
    text: String(context.text || ''),
    query: String(context.text || ''),
    args: context.args || [],
    command: String(context.command || '').toLowerCase(),
    prefix: context.usedPrefix || '.',
    usedPrefix: context.usedPrefix || '.',
    db: global.db
  })
}
__umiHandler.help = ["uptodown"]
__umiHandler.tags = ["search"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
