import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setintro", "category": "group", "aliasMap": {"umi-group-setintro": "setintro", "umi-setintro": "setintro", "umi-setperkenalan": "setperkenalan", "umi-introset": "introset", "setperkenalan": "setperkenalan", "introset": "introset"}, "description": "Set pesan intro grup (admin only)", "usage": ".setintro <pesan>", "example": ".setintro Selamat datang @user di @group!", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/setintro.js", metadata, m, extra)
handler.help = ["umi-group-setintro <pesan>"]
handler.command = ["umi-group-setintro", "umi-setintro", "umi-setperkenalan", "umi-introset", "setperkenalan", "introset"]
handler.tags = ["group"]
handler.description = "Set pesan intro grup (admin only)"
handler.importSource = "umi"
handler.importConfig = {"name": "setintro", "alias": ["setperkenalan", "introset"], "category": "group", "description": "Set pesan intro grup (admin only)", "usage": ".setintro <pesan>", "example": ".setintro Selamat datang @user di @group!", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-setintro": "setintro", "umi-setintro": "setintro", "umi-setperkenalan": "setperkenalan", "umi-introset": "introset", "setperkenalan": "setperkenalan", "introset": "introset"}
export default handler
