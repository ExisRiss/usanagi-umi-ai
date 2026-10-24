import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "close", "category": "group", "aliasMap": {"umi-group-close": "close", "umi-close": "close", "umi-tutup": "tutup", "umi-closegroup": "closegroup", "umi-tutupgroup": "tutupgroup", "close": "close", "tutup": "tutup", "closegroup": "closegroup", "tutupgroup": "tutupgroup"}, "description": "Menutup grup agar hanya admin yang bisa chat", "usage": ".close", "example": ".close", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/close.js", metadata, m, extra)
handler.help = ["umi-group-close"]
handler.command = ["umi-group-close", "umi-close", "umi-tutup", "umi-closegroup", "umi-tutupgroup", "close", "tutup", "closegroup", "tutupgroup"]
handler.tags = ["group"]
handler.description = "Menutup grup agar hanya admin yang bisa chat"
handler.importSource = "umi"
handler.importConfig = {"name": "close", "alias": ["tutup", "closegroup", "tutupgroup"], "category": "group", "description": "Menutup grup agar hanya admin yang bisa chat", "usage": ".close", "example": ".close", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-close": "close", "umi-close": "close", "umi-tutup": "tutup", "umi-closegroup": "closegroup", "umi-tutupgroup": "tutupgroup", "close": "close", "tutup": "tutup", "closegroup": "closegroup", "tutupgroup": "tutupgroup"}
export default handler
