/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hostmedia", "category": "tools", "aliasMap": {"umi-tools-hostmedia": "hostmedia", "umi-hostmedia": "hostmedia", "umi-serverhostmedia": "serverhostmedia", "umi-hostmed": "hostmed", "hostmedia": "hostmedia", "serverhostmedia": "serverhostmedia", "hostmed": "hostmed"}, "description": "Nampilin daftar server host media beserta batas maksimalnya", "usage": "hostmedia", "example": "hostmedia", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hostmedia.js", metadata, m, extra)
handler.help = ["umi-tools-hostmedia"]
handler.command = ["umi-tools-hostmedia", "umi-hostmedia", "umi-serverhostmedia", "umi-hostmed", "hostmedia", "serverhostmedia", "hostmed"]
handler.tags = ["tools"]
handler.description = "Nampilin daftar server host media beserta batas maksimalnya"
handler.importSource = "umi"
handler.importConfig = {"name": "hostmedia", "alias": ["serverhostmedia", "hostmedia", "hostmed"], "category": "tools", "description": "Nampilin daftar server host media beserta batas maksimalnya", "usage": "hostmedia", "example": "hostmedia", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-hostmedia": "hostmedia", "umi-hostmedia": "hostmedia", "umi-serverhostmedia": "serverhostmedia", "umi-hostmed": "hostmed", "hostmedia": "hostmedia", "serverhostmedia": "serverhostmedia", "hostmed": "hostmed"}
export default handler
