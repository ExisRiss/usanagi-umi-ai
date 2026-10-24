/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "notifch", "category": "owner", "aliasMap": {"umi-owner-notifch": "notifch", "umi-notifch": "notifch", "umi-mutech": "mutech", "notifch": "notifch", "mutech": "mutech"}, "description": "Mengatur notifikasi channel WhatsApp yang diikuti bot", "usage": ".notifch <nomor>|on/off", "example": ".notifch 1,3|on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/notifch.js", metadata, m, extra)
handler.help = ["umi-owner-notifch <nomor>|on/off"]
handler.command = ["umi-owner-notifch", "umi-notifch", "umi-mutech", "notifch", "mutech"]
handler.tags = ["owner"]
handler.description = "Mengatur notifikasi channel WhatsApp yang diikuti bot"
handler.importSource = "umi"
handler.importConfig = {"name": "notifch", "alias": ["mutech"], "category": "owner", "description": "Mengatur notifikasi channel WhatsApp yang diikuti bot", "usage": ".notifch <nomor>|on/off", "example": ".notifch 1,3|on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-notifch": "notifch", "umi-notifch": "notifch", "umi-mutech": "mutech", "notifch": "notifch", "mutech": "mutech"}
export default handler
