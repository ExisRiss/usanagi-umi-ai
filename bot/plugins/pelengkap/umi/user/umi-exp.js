import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "exp", "category": "user", "aliasMap": {"umi-user-exp": "exp", "umi-cekexp": "cekexp", "umi-myexp": "myexp", "umi-xp": "xp", "cekexp": "cekexp", "myexp": "myexp", "xp": "xp"}, "description": "Cek exp user", "usage": ".exp [@user]", "example": ".exp", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/exp.js", metadata, m, extra)
handler.help = ["umi-user-exp [@user]"]
handler.command = ["umi-user-exp", "umi-cekexp", "umi-myexp", "umi-xp", "cekexp", "myexp", "xp"]
handler.tags = ["user"]
handler.description = "Cek exp user"
handler.importSource = "umi"
handler.importConfig = {"name": "exp", "alias": ["cekexp", "myexp", "xp"], "category": "user", "description": "Cek exp user", "usage": ".exp [@user]", "example": ".exp", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-exp": "exp", "umi-cekexp": "cekexp", "umi-myexp": "myexp", "umi-xp": "xp", "cekexp": "cekexp", "myexp": "myexp", "xp": "xp"}
export default handler
