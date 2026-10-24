/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listwarn", "category": "group", "aliasMap": {"umi-group-listwarn": "listwarn", "umi-listwarn": "listwarn", "umi-warnings": "warnings", "umi-cekwarn": "cekwarn", "umi-warnlist": "warnlist", "listwarn": "listwarn", "warnings": "warnings", "cekwarn": "cekwarn", "warnlist": "warnlist"}, "description": "Melihat daftar warning member", "usage": ".listwarn atau .listwarn @user", "example": ".listwarn @user", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/listwarn.js", metadata, m, extra)
handler.help = ["umi-group-listwarn atau .listwarn @user"]
handler.command = ["umi-group-listwarn", "umi-listwarn", "umi-warnings", "umi-cekwarn", "umi-warnlist", "listwarn", "warnings", "cekwarn", "warnlist"]
handler.tags = ["group"]
handler.description = "Melihat daftar warning member"
handler.importSource = "umi"
handler.importConfig = {"name": "listwarn", "alias": ["warnings", "cekwarn", "warnlist"], "category": "group", "description": "Melihat daftar warning member", "usage": ".listwarn atau .listwarn @user", "example": ".listwarn @user", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-listwarn": "listwarn", "umi-listwarn": "listwarn", "umi-warnings": "warnings", "umi-cekwarn": "cekwarn", "umi-warnlist": "warnlist", "listwarn": "listwarn", "warnings": "warnings", "cekwarn": "cekwarn", "warnlist": "warnlist"}
export default handler
