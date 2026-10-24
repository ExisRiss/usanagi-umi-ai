import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mulung", "category": "rpg", "aliasMap": {"umi-rpg-mulung": "mulung", "umi-mulung": "mulung", "umi-scavenge": "scavenge", "umi-kumpulsampah": "kumpulsampah"}, "description": "Memulung untuk mengumpulkan barang", "usage": ".mulung", "example": ".mulung", "cooldown": 300, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/mulung.js", metadata, m, extra)
handler.help = ["umi-rpg-mulung"]
handler.command = ["umi-rpg-mulung", "umi-mulung", "umi-scavenge", "umi-kumpulsampah"]
handler.tags = ["rpg"]
handler.description = "Memulung untuk mengumpulkan barang"
handler.importSource = "umi"
handler.importConfig = {"name": "mulung", "alias": ["scavenge", "kumpulsampah"], "category": "rpg", "description": "Memulung untuk mengumpulkan barang", "usage": ".mulung", "example": ".mulung", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 300, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-mulung": "mulung", "umi-mulung": "mulung", "umi-scavenge": "scavenge", "umi-kumpulsampah": "kumpulsampah"}
export default handler
