/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wuwa", "category": "anime", "aliasMap": {"umi-anime-wuwa": "wuwa", "umi-wuwa": "wuwa", "umi-wuwasheet": "wuwasheet", "umi-wutheringwaves": "wutheringwaves", "umi-wuwa-sheets": "wuwa-sheets", "wuwa": "wuwa", "wuwasheet": "wuwasheet", "wutheringwaves": "wutheringwaves", "wuwa-sheets": "wuwa-sheets"}, "description": "Menampilkan sheet material karakter Wuthering Waves", "usage": ".wuwa <nama karakter>", "example": ".wuwa sanhua", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/wuwa.js", metadata, m, extra)
handler.help = ["umi-anime-wuwa <nama karakter>"]
handler.command = ["umi-anime-wuwa", "umi-wuwa", "umi-wuwasheet", "umi-wutheringwaves", "umi-wuwa-sheets", "wuwa", "wuwasheet", "wutheringwaves", "wuwa-sheets"]
handler.tags = ["anime"]
handler.description = "Menampilkan sheet material karakter Wuthering Waves"
handler.importSource = "umi"
handler.importConfig = {"name": "wuwa", "alias": ["wuwasheet", "wutheringwaves", "wuwa-sheets"], "category": "anime", "description": "Menampilkan sheet material karakter Wuthering Waves", "usage": ".wuwa <nama karakter>", "example": ".wuwa sanhua", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-wuwa": "wuwa", "umi-wuwa": "wuwa", "umi-wuwasheet": "wuwasheet", "umi-wutheringwaves": "wutheringwaves", "umi-wuwa-sheets": "wuwa-sheets", "wuwa": "wuwa", "wuwasheet": "wuwasheet", "wutheringwaves": "wutheringwaves", "wuwa-sheets": "wuwa-sheets"}
export default handler
