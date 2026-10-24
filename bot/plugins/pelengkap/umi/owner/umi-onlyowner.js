/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "onlyowner", "category": "owner", "aliasMap": {"umi-owner-onlyowner": "onlyowner", "umi-onlyowner": "onlyowner", "umi-onlyownerbot": "onlyownerbot", "umi-modeowner": "modeowner", "umi-owneronly": "owneronly", "onlyowner": "onlyowner", "onlyownerbot": "onlyownerbot", "modeowner": "modeowner", "owneronly": "owneronly"}, "description": "Atur mode hanya owner yang bisa pakai bot (owner utama + owner tambahan + creator)", "usage": ".onlyowner on/off", "example": ".onlyowner on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/onlyowner.js", metadata, m, extra)
handler.help = ["umi-owner-onlyowner on/off"]
handler.command = ["umi-owner-onlyowner", "umi-onlyowner", "umi-onlyownerbot", "umi-modeowner", "umi-owneronly", "onlyowner", "onlyownerbot", "modeowner", "owneronly"]
handler.tags = ["owner"]
handler.description = "Atur mode hanya owner yang bisa pakai bot (owner utama + owner tambahan + creator)"
handler.importSource = "umi"
handler.importConfig = {"name": "onlyowner", "alias": ["onlyownerbot", "modeowner", "owneronly"], "category": "owner", "description": "Atur mode hanya owner yang bisa pakai bot (owner utama + owner tambahan + creator)", "usage": ".onlyowner on/off", "example": ".onlyowner on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-onlyowner": "onlyowner", "umi-onlyowner": "onlyowner", "umi-onlyownerbot": "onlyownerbot", "umi-modeowner": "modeowner", "umi-owneronly": "owneronly", "onlyowner": "onlyowner", "onlyownerbot": "onlyownerbot", "modeowner": "modeowner", "owneronly": "owneronly"}
export default handler
