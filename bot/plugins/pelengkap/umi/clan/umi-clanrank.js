import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanrank", "category": "clan", "aliasMap": {"umi-clan-clanrank": "clanrank", "umi-clanrank": "clanrank", "umi-rankclan": "rankclan", "umi-peringkatclan": "peringkatclan", "clanrank": "clanrank", "rankclan": "rankclan", "peringkatclan": "peringkatclan"}, "description": "Lihat peringkat clan kamu", "usage": ".clanrank", "example": ".clanrank", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanrank.js", metadata, m, extra)
handler.help = ["umi-clan-clanrank"]
handler.command = ["umi-clan-clanrank", "umi-clanrank", "umi-rankclan", "umi-peringkatclan", "clanrank", "rankclan", "peringkatclan"]
handler.tags = ["clan"]
handler.description = "Lihat peringkat clan kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "clanrank", "alias": ["rankclan", "peringkatclan"], "category": "clan", "description": "Lihat peringkat clan kamu", "usage": ".clanrank", "example": ".clanrank", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanrank": "clanrank", "umi-clanrank": "clanrank", "umi-rankclan": "rankclan", "umi-peringkatclan": "peringkatclan", "clanrank": "clanrank", "rankclan": "rankclan", "peringkatclan": "peringkatclan"}
export default handler
