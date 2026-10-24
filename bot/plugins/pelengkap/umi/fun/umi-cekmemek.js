import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekmemek", "category": "fun", "aliasMap": {"umi-fun-cekmemek": "cekmemek", "umi-cekmemek": "cekmemek", "umi-cekmmk": "cekmmk", "cekmemek": "cekmemek", "cekmmk": "cekmmk"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/cekmemek.js", metadata, m, extra)
handler.help = ["umi-fun-cekmemek"]
handler.command = ["umi-fun-cekmemek", "umi-cekmemek", "umi-cekmmk", "cekmemek", "cekmmk"]
handler.tags = ["fun"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "cekmemek", "alias": ["cekmmk"], "category": "fun", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-cekmemek": "cekmemek", "umi-cekmemek": "cekmemek", "umi-cekmmk": "cekmmk", "cekmemek": "cekmemek", "cekmmk": "cekmmk"}
export default handler
