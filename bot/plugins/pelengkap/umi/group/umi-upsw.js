/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "upsw", "category": "group", "aliasMap": {"umi-group-upsw": "upsw", "umi-upsw": "upsw", "umi-upstory": "upstory", "umi-storygc": "storygc", "upsw": "upsw", "upstory": "upstory", "storygc": "storygc"}, "description": "Upload story untuk grup (border hijau)", "usage": ".upsw <teks> / reply media", "example": ".upsw Halo semua", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/upsw.js", metadata, m, extra)
handler.help = ["umi-group-upsw <teks> / reply media"]
handler.command = ["umi-group-upsw", "umi-upsw", "umi-upstory", "umi-storygc", "upsw", "upstory", "storygc"]
handler.tags = ["group"]
handler.description = "Upload story untuk grup (border hijau)"
handler.importSource = "umi"
handler.importConfig = {"name": "upsw", "alias": ["upstory", "storygc"], "category": "group", "description": "Upload story untuk grup (border hijau)", "usage": ".upsw <teks> / reply media", "example": ".upsw Halo semua", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-upsw": "upsw", "umi-upsw": "upsw", "umi-upstory": "upstory", "umi-storygc": "storygc", "upsw": "upsw", "upstory": "upstory", "storygc": "storygc"}
export default handler
