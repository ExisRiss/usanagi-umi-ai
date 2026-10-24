import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "work", "category": "rpg", "aliasMap": {"umi-rpg-work": "work", "umi-work": "work", "umi-kerja": "kerja", "umi-job": "job"}, "description": "Bekerja untuk mendapatkan uang", "usage": ".work", "example": ".work", "cooldown": 180, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/work.js", metadata, m, extra)
handler.help = ["umi-rpg-work"]
handler.command = ["umi-rpg-work", "umi-work", "umi-kerja", "umi-job"]
handler.tags = ["rpg"]
handler.description = "Bekerja untuk mendapatkan uang"
handler.importSource = "umi"
handler.importConfig = {"name": "work", "alias": ["kerja", "job"], "category": "rpg", "description": "Bekerja untuk mendapatkan uang", "usage": ".work", "example": ".work", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 180, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-work": "work", "umi-work": "work", "umi-kerja": "kerja", "umi-job": "job"}
export default handler
