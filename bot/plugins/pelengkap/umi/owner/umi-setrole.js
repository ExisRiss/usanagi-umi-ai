/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setrole", "category": "owner", "aliasMap": {"umi-owner-setrole": "setrole", "umi-setrole": "setrole", "umi-setroleuser": "setroleuser", "setrole": "setrole", "setroleuser": "setroleuser"}, "description": "Mengatur role/karakter hubungan user yang dipakai AutoAI", "usage": ".setrole @user|role atau reply pesan", "example": ".setrole @628xxx|teman", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setrole.js", metadata, m, extra)
handler.help = ["umi-owner-setrole @user|role atau reply pesan"]
handler.command = ["umi-owner-setrole", "umi-setrole", "umi-setroleuser", "setrole", "setroleuser"]
handler.tags = ["owner"]
handler.description = "Mengatur role/karakter hubungan user yang dipakai AutoAI"
handler.importSource = "umi"
handler.importConfig = {"name": "setrole", "alias": ["setroleuser"], "category": "owner", "description": "Mengatur role/karakter hubungan user yang dipakai AutoAI", "usage": ".setrole @user|role atau reply pesan", "example": ".setrole @628xxx|teman", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setrole": "setrole", "umi-setrole": "setrole", "umi-setroleuser": "setroleuser", "setrole": "setrole", "setroleuser": "setroleuser"}
export default handler
