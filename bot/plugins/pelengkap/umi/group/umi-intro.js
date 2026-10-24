import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "intro", "category": "group", "aliasMap": {"umi-group-intro": "intro", "umi-intro": "intro", "umi-perkenalan": "perkenalan", "umi-selamatdatang": "selamatdatang", "perkenalan": "perkenalan", "selamatdatang": "selamatdatang"}, "description": "Tampilkan pesan intro grup", "usage": ".intro", "example": ".intro", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/intro.js", metadata, m, extra)
handler.help = ["umi-group-intro"]
handler.command = ["umi-group-intro", "umi-intro", "umi-perkenalan", "umi-selamatdatang", "perkenalan", "selamatdatang"]
handler.tags = ["group"]
handler.description = "Tampilkan pesan intro grup"
handler.importSource = "umi"
handler.importConfig = {"name": "intro", "alias": ["perkenalan", "selamatdatang"], "category": "group", "description": "Tampilkan pesan intro grup", "usage": ".intro", "example": ".intro", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-intro": "intro", "umi-intro": "intro", "umi-perkenalan": "perkenalan", "umi-selamatdatang": "selamatdatang", "perkenalan": "perkenalan", "selamatdatang": "selamatdatang"}
export default handler
