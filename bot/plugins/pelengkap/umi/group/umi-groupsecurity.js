/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "groupsecurity", "category": "group", "aliasMap": {"umi-group-groupsecurity": "groupsecurity", "umi-groupsecurity": "groupsecurity", "umi-grupsecurity": "grupsecurity", "umi-groupsec": "groupsec", "umi-grupsec": "grupsec", "umi-securitygrup": "securitygrup", "groupsecurity": "groupsecurity", "grupsecurity": "grupsecurity", "groupsec": "groupsec", "grupsec": "grupsec", "securitygrup": "securitygrup"}, "description": "Preset keamanan grup ketat untuk berbagai proteksi Umi", "usage": ".groupsecurity <on/off/status>", "example": ".groupsecurity on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/groupsecurity.js", metadata, m, extra)
handler.help = ["umi-group-groupsecurity <on/off/status>"]
handler.command = ["umi-group-groupsecurity", "umi-groupsecurity", "umi-grupsecurity", "umi-groupsec", "umi-grupsec", "umi-securitygrup", "groupsecurity", "grupsecurity", "groupsec", "grupsec", "securitygrup"]
handler.tags = ["group"]
handler.description = "Preset keamanan grup ketat untuk berbagai proteksi Umi"
handler.importSource = "umi"
handler.importConfig = {"name": "groupsecurity", "alias": ["grupsecurity", "groupsec", "grupsec", "securitygrup"], "category": "group", "description": "Preset keamanan grup ketat untuk berbagai proteksi Umi", "usage": ".groupsecurity <on/off/status>", "example": ".groupsecurity on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-groupsecurity": "groupsecurity", "umi-groupsecurity": "groupsecurity", "umi-grupsecurity": "grupsecurity", "umi-groupsec": "groupsec", "umi-grupsec": "grupsec", "umi-securitygrup": "securitygrup", "groupsecurity": "groupsecurity", "grupsecurity": "grupsecurity", "groupsec": "groupsec", "grupsec": "grupsec", "securitygrup": "securitygrup"}
export default handler
