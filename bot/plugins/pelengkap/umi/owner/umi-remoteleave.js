import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "remoteleave", "category": "owner", "aliasMap": {"umi-owner-remoteleave": "remoteleave", "umi-remoteleave": "remoteleave", "umi-leavegroupbot": "leavegroupbot", "remoteleave": "remoteleave", "leavegroupbot": "leavegroupbot"}, "description": "Memilih grup tertentu untuk bot tinggalkan dari satu menu", "usage": ".remoteleave", "example": ".remoteleave", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/remoteleave.js", metadata, m, extra)
handler.help = ["umi-owner-remoteleave"]
handler.command = ["umi-owner-remoteleave", "umi-remoteleave", "umi-leavegroupbot", "remoteleave", "leavegroupbot"]
handler.tags = ["owner"]
handler.description = "Memilih grup tertentu untuk bot tinggalkan dari satu menu"
handler.importSource = "umi"
handler.importConfig = {"name": "remoteleave", "alias": ["leavegroupbot"], "category": "owner", "description": "Memilih grup tertentu untuk bot tinggalkan dari satu menu", "usage": ".remoteleave", "example": ".remoteleave", "isOwner": true, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-remoteleave": "remoteleave", "umi-remoteleave": "remoteleave", "umi-leavegroupbot": "leavegroupbot", "remoteleave": "remoteleave", "leavegroupbot": "leavegroupbot"}
export default handler
