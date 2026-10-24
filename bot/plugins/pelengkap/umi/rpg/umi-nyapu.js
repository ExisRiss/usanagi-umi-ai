import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nyapu", "category": "rpg", "aliasMap": {"umi-rpg-nyapu": "nyapu", "umi-nyapu": "nyapu", "umi-cleaning": "cleaning", "umi-bersih": "bersih"}, "description": "Nyapu jalan, siapa tau nemu barang jatuh!", "usage": ".nyapu", "example": ".nyapu", "cooldown": 120, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/nyapu.js", metadata, m, extra)
handler.help = ["umi-rpg-nyapu"]
handler.command = ["umi-rpg-nyapu", "umi-nyapu", "umi-cleaning", "umi-bersih"]
handler.tags = ["rpg"]
handler.description = "Nyapu jalan, siapa tau nemu barang jatuh!"
handler.importSource = "umi"
handler.importConfig = {"name": "nyapu", "alias": ["cleaning", "bersih"], "category": "rpg", "description": "Nyapu jalan, siapa tau nemu barang jatuh!", "usage": ".nyapu", "example": ".nyapu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-nyapu": "nyapu", "umi-nyapu": "nyapu", "umi-cleaning": "cleaning", "umi-bersih": "bersih"}
export default handler
