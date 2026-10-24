import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stamina", "category": "rpg", "aliasMap": {"umi-rpg-stamina": "stamina", "umi-stamina": "stamina", "umi-cekstamina": "cekstamina"}, "description": "Cek dan pulihkan stamina", "usage": ".stamina / .stamina isi", "example": ".stamina", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/stamina.js", metadata, m, extra)
handler.help = ["umi-rpg-stamina / .stamina isi"]
handler.command = ["umi-rpg-stamina", "umi-stamina", "umi-cekstamina"]
handler.tags = ["rpg"]
handler.description = "Cek dan pulihkan stamina"
handler.importSource = "umi"
handler.importConfig = {"name": "stamina", "alias": ["energy", "cekstamina"], "category": "rpg", "description": "Cek dan pulihkan stamina", "usage": ".stamina / .stamina isi", "example": ".stamina", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-stamina": "stamina", "umi-stamina": "stamina", "umi-cekstamina": "cekstamina"}
export default handler
