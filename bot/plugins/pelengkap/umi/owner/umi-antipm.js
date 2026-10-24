import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antipm", "category": "owner", "aliasMap": {"umi-owner-antipm": "antipm", "umi-antipm": "antipm", "umi-apm": "apm", "umi-nopm": "nopm", "antipm": "antipm", "apm": "apm", "nopm": "nopm"}, "description": "Anti PM - cuma nomor tertentu yang bisa chat ke bot (BLOKIR ASLI)", "usage": ".antipm <on/off/status>", "example": ".antipm on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/antipm.js", metadata, m, extra)
handler.help = ["umi-owner-antipm <on/off/status>"]
handler.command = ["umi-owner-antipm", "umi-antipm", "umi-apm", "umi-nopm", "antipm", "apm", "nopm"]
handler.tags = ["owner"]
handler.description = "Anti PM - cuma nomor tertentu yang bisa chat ke bot (BLOKIR ASLI)"
handler.importSource = "umi"
handler.importConfig = {"name": "antipm", "alias": ["apm", "nopm"], "category": "owner", "description": "Anti PM - cuma nomor tertentu yang bisa chat ke bot (BLOKIR ASLI)", "usage": ".antipm <on/off/status>", "example": ".antipm on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "isAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-antipm": "antipm", "umi-antipm": "antipm", "umi-apm": "apm", "umi-nopm": "nopm", "antipm": "antipm", "apm": "apm", "nopm": "nopm"}
export default handler
