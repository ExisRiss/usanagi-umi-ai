/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "profile", "category": "user", "aliasMap": {"umi-user-profile": "profile", "umi-profile": "profile", "umi-me": "me", "umi-profil": "profil", "umi-myprofile": "myprofile", "umi-my": "my", "myprofile": "myprofile"}, "description": "Melihat profil user dengan RPG stats", "usage": ".profile [@user]", "example": ".profile", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/profile.js", metadata, m, extra)
handler.help = ["umi-user-profile [@user]"]
handler.command = ["umi-user-profile", "umi-profile", "umi-me", "umi-profil", "umi-myprofile", "umi-my", "myprofile"]
handler.tags = ["user"]
handler.description = "Melihat profil user dengan RPG stats"
handler.importSource = "umi"
handler.importConfig = {"name": "profile", "alias": ["me", "profil", "myprofile", "my", "stats", "status"], "category": "user", "description": "Melihat profil user dengan RPG stats", "usage": ".profile [@user]", "example": ".profile", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-profile": "profile", "umi-profile": "profile", "umi-me": "me", "umi-profil": "profil", "umi-myprofile": "myprofile", "umi-my": "my", "myprofile": "myprofile"}
export default handler
