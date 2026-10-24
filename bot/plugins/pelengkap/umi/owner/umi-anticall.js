/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anticall", "category": "owner", "aliasMap": {"umi-owner-anticall": "anticall", "umi-anticall": "anticall", "umi-antitelpon": "antitelpon", "umi-antitelp": "antitelp", "umi-rejectcall": "rejectcall", "antitelpon": "antitelpon", "antitelp": "antitelp", "rejectcall": "rejectcall"}, "description": "Auto tolak panggilan masuk", "usage": ".anticall on/off", "example": ".anticall on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/anticall.js", metadata, m, extra)
handler.help = ["umi-owner-anticall on/off"]
handler.command = ["umi-owner-anticall", "umi-anticall", "umi-antitelpon", "umi-antitelp", "umi-rejectcall", "antitelpon", "antitelp", "rejectcall"]
handler.tags = ["owner"]
handler.description = "Auto tolak panggilan masuk"
handler.importSource = "umi"
handler.importConfig = {"name": "anticall", "alias": ["antitelpon", "antitelp", "rejectcall"], "category": "owner", "description": "Auto tolak panggilan masuk", "usage": ".anticall on/off", "example": ".anticall on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-anticall": "anticall", "umi-anticall": "anticall", "umi-antitelpon": "antitelpon", "umi-antitelp": "antitelp", "umi-rejectcall": "rejectcall", "antitelpon": "antitelpon", "antitelp": "antitelp", "rejectcall": "rejectcall"}
export default handler
