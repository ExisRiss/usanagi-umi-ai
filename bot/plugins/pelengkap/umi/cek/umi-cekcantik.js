import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekcantik", "category": "cek", "aliasMap": {"umi-cek-cekcantik": "cekcantik", "umi-cekcantik": "cekcantik", "umi-cantik": "cantik", "umi-beautiful": "beautiful", "beautiful": "beautiful"}, "description": "Cek seberapa cantik kamu", "usage": ".cekcantik <nama>", "example": ".cekcantik Ani", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekcantik.js", metadata, m, extra)
handler.help = ["umi-cek-cekcantik <nama>"]
handler.command = ["umi-cek-cekcantik", "umi-cekcantik", "umi-cantik", "umi-beautiful", "beautiful"]
handler.tags = ["cek"]
handler.description = "Cek seberapa cantik kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekcantik", "alias": ["cantik", "beautiful"], "category": "cek", "description": "Cek seberapa cantik kamu", "usage": ".cekcantik <nama>", "example": ".cekcantik Ani", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekcantik": "cekcantik", "umi-cekcantik": "cekcantik", "umi-cantik": "cantik", "umi-beautiful": "beautiful", "beautiful": "beautiful"}
export default handler
