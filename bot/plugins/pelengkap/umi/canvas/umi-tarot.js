import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tarot", "category": "fun", "aliasMap": {"umi-fun-tarot": "tarot", "umi-tarot": "tarot", "umi-karturama": "karturama", "umi-tarotcard": "tarotcard", "tarotcard": "tarotcard"}, "description": "Generate kartu tarot harian lengkap dengan visual card", "usage": ".tarot [nomor/nama] [terbalik|upright]", "example": ".tarot 10 terbalik", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/tarot.js", metadata, m, extra)
handler.help = ["umi-fun-tarot [nomor/nama] [terbalik|upright]"]
handler.command = ["umi-fun-tarot", "umi-tarot", "umi-karturama", "umi-tarotcard", "tarotcard"]
handler.tags = ["fun"]
handler.description = "Generate kartu tarot harian lengkap dengan visual card"
handler.importSource = "umi"
handler.importConfig = {"name": "tarot", "alias": ["karturama", "tarotcard"], "category": "fun", "description": "Generate kartu tarot harian lengkap dengan visual card", "usage": ".tarot [nomor/nama] [terbalik|upright]", "example": ".tarot 10 terbalik", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-tarot": "tarot", "umi-tarot": "tarot", "umi-karturama": "karturama", "umi-tarotcard": "tarotcard", "tarotcard": "tarotcard"}
export default handler
