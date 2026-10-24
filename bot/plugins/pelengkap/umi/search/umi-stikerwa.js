/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stikerwa", "category": "search", "aliasMap": {"umi-search-stikerwa": "stikerwa", "umi-stikerwa": "stikerwa", "umi-stickerwa": "stickerwa", "umi-wasearch": "wasearch", "umi-wassticker": "wassticker", "umi-stkrwa": "stkrwa", "stikerwa": "stikerwa", "stickerwa": "stickerwa", "wasearch": "wasearch", "wassticker": "wassticker", "stkrwa": "stkrwa"}, "description": "Cari sticker WhatsApp", "usage": ".stikerwa <query>", "example": ".stikerwa anime", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/stikerwa.js", metadata, m, extra)
handler.help = ["umi-search-stikerwa <query>"]
handler.command = ["umi-search-stikerwa", "umi-stikerwa", "umi-stickerwa", "umi-wasearch", "umi-wassticker", "umi-stkrwa", "stikerwa", "stickerwa", "wasearch", "wassticker", "stkrwa"]
handler.tags = ["search"]
handler.description = "Cari sticker WhatsApp"
handler.importSource = "umi"
handler.importConfig = {"name": "stikerwa", "alias": ["stickerwa", "wasearch", "wassticker", "stkrwa"], "category": "search", "description": "Cari sticker WhatsApp", "usage": ".stikerwa <query>", "example": ".stikerwa anime", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-stikerwa": "stikerwa", "umi-stikerwa": "stikerwa", "umi-stickerwa": "stickerwa", "umi-wasearch": "wasearch", "umi-wassticker": "wassticker", "umi-stkrwa": "stkrwa", "stikerwa": "stikerwa", "stickerwa": "stickerwa", "wasearch": "wasearch", "wassticker": "wassticker", "stkrwa": "stkrwa"}
export default handler
