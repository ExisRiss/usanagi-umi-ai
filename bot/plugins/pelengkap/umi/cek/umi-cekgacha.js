import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekgacha", "category": "cek", "aliasMap": {"umi-cek-cekgacha": "cekgacha", "umi-cekgacha": "cekgacha", "umi-luck": "luck", "luck": "luck"}, "description": "Cek hoki gacha kamu", "usage": ".cekgacha <nama>", "example": ".cekgacha Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekgacha.js", metadata, m, extra)
handler.help = ["umi-cek-cekgacha <nama>"]
handler.command = ["umi-cek-cekgacha", "umi-cekgacha", "umi-luck", "luck"]
handler.tags = ["cek"]
handler.description = "Cek hoki gacha kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekgacha", "alias": ["gacha", "luck"], "category": "cek", "description": "Cek hoki gacha kamu", "usage": ".cekgacha <nama>", "example": ".cekgacha Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekgacha": "cekgacha", "umi-cekgacha": "cekgacha", "umi-luck": "luck", "luck": "luck"}
export default handler
