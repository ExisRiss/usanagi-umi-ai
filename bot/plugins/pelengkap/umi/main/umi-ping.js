/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ping", "category": "main", "aliasMap": {"umi-main-ping": "ping", "umi-ping": "ping", "umi-speed": "speed", "umi-p": "p", "umi-latency": "latency", "umi-sys": "sys", "speed": "speed", "p": "p", "latency": "latency", "sys": "sys", "status": "status"}, "description": "Cek performa dan status sistem bot secara real-time (Canvas Epic)", "usage": ".ping", "example": ".ping", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/ping.js", metadata, m, extra)
handler.help = ["umi-main-ping"]
handler.command = ["umi-main-ping", "umi-ping", "umi-speed", "umi-p", "umi-latency", "umi-sys", "speed", "p", "latency", "sys", "status"]
handler.tags = ["main"]
handler.description = "Cek performa dan status sistem bot secara real-time (Canvas Epic)"
handler.importSource = "umi"
handler.importConfig = {"name": "ping", "alias": ["speed", "p", "latency", "sys", "status"], "category": "main", "description": "Cek performa dan status sistem bot secara real-time (Canvas Epic)", "usage": ".ping", "example": ".ping", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-ping": "ping", "umi-ping": "ping", "umi-speed": "speed", "umi-p": "p", "umi-latency": "latency", "umi-sys": "sys", "speed": "speed", "p": "p", "latency": "latency", "sys": "sys", "status": "status"}
export default handler
