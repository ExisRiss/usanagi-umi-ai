import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakechat", "category": "fun", "aliasMap": {"umi-fun-fakechat": "fakechat", "umi-fakechat": "fakechat", "umi-fc": "fc", "umi-fakemsg": "fakemsg"}, "description": "Generate fake WhatsApp chat", "usage": ".fakechat @user | pesan", "example": ".fakechat @user | Kamu ganteng banget!", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/fakechat.js", metadata, m, extra)
handler.help = ["umi-fun-fakechat @user | pesan"]
handler.command = ["umi-fun-fakechat", "umi-fakechat", "umi-fc", "umi-fakemsg"]
handler.tags = ["fun"]
handler.description = "Generate fake WhatsApp chat"
handler.importSource = "umi"
handler.importConfig = {"name": "fakechat", "alias": ["fc", "fakemsg"], "category": "fun", "description": "Generate fake WhatsApp chat", "usage": ".fakechat @user | pesan", "example": ".fakechat @user | Kamu ganteng banget!", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-fakechat": "fakechat", "umi-fakechat": "fakechat", "umi-fc": "fc", "umi-fakemsg": "fakemsg"}
export default handler
