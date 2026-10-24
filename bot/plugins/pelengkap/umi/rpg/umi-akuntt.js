/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "akuntiktok", "category": "rpg", "aliasMap": {"umi-rpg-akuntiktok": "akuntiktok", "umi-akuntiktok": "akuntiktok", "umi-akuntiktokprofile": "akuntiktokprofile", "umi-akuntt": "akuntt", "akuntiktok": "akuntiktok", "akuntiktokprofile": "akuntiktokprofile", "akuntt": "akuntt"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/akuntt.js", metadata, m, extra)
handler.help = ["umi-rpg-akuntiktok"]
handler.command = ["umi-rpg-akuntiktok", "umi-akuntiktok", "umi-akuntiktokprofile", "umi-akuntt", "akuntiktok", "akuntiktokprofile", "akuntt"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "akuntiktok", "alias": ["akuntiktokprofile", "akuntt"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-akuntiktok": "akuntiktok", "umi-akuntiktok": "akuntiktok", "umi-akuntiktokprofile": "akuntiktokprofile", "umi-akuntt": "akuntt", "akuntiktok": "akuntiktok", "akuntiktokprofile": "akuntiktokprofile", "akuntt": "akuntt"}
export default handler
