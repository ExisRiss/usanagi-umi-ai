import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekcreative", "category": "cek", "aliasMap": {"umi-cek-cekcreative": "cekcreative", "umi-cekcreative": "cekcreative", "umi-creative": "creative", "umi-kreatif": "kreatif", "kreatif": "kreatif"}, "description": "Cek tingkat kreativitas kamu", "usage": ".cekcreative <nama>", "example": ".cekcreative Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekcreative.js", metadata, m, extra)
handler.help = ["umi-cek-cekcreative <nama>"]
handler.command = ["umi-cek-cekcreative", "umi-cekcreative", "umi-creative", "umi-kreatif", "kreatif"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kreativitas kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekcreative", "alias": ["creative", "kreatif"], "category": "cek", "description": "Cek tingkat kreativitas kamu", "usage": ".cekcreative <nama>", "example": ".cekcreative Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekcreative": "cekcreative", "umi-cekcreative": "cekcreative", "umi-creative": "creative", "umi-kreatif": "kreatif", "kreatif": "kreatif"}
export default handler
