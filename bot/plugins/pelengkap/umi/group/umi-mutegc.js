import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mutegc", "category": "group", "aliasMap": {"umi-group-mutegc": "mutegc", "umi-mutegc": "mutegc", "umi-mutegrup": "mutegrup", "umi-mutebot": "mutebot", "umi-blockbot": "blockbot", "umi-lockbot": "lockbot", "mutegc": "mutegc", "mutegrup": "mutegrup", "mutebot": "mutebot", "blockbot": "blockbot", "lockbot": "lockbot"}, "description": "Blokir command bot untuk member, hanya admin/owner yang bisa pakai", "usage": ".mutegc", "example": ".mutegc", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/mutegc.js", metadata, m, extra)
handler.help = ["umi-group-mutegc"]
handler.command = ["umi-group-mutegc", "umi-mutegc", "umi-mutegrup", "umi-mutebot", "umi-blockbot", "umi-lockbot", "mutegc", "mutegrup", "mutebot", "blockbot", "lockbot"]
handler.tags = ["group"]
handler.description = "Blokir command bot untuk member, hanya admin/owner yang bisa pakai"
handler.importSource = "umi"
handler.importConfig = {"name": "mutegc", "alias": ["mutegrup", "mutebot", "blockbot", "lockbot"], "category": "group", "description": "Blokir command bot untuk member, hanya admin/owner yang bisa pakai", "usage": ".mutegc", "example": ".mutegc", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-mutegc": "mutegc", "umi-mutegc": "mutegc", "umi-mutegrup": "mutegrup", "umi-mutebot": "mutebot", "umi-blockbot": "blockbot", "umi-lockbot": "lockbot", "mutegc": "mutegc", "mutegrup": "mutegrup", "mutebot": "mutebot", "blockbot": "blockbot", "lockbot": "lockbot"}
export default handler
