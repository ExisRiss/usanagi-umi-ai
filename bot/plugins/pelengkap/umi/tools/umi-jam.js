import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "timeis", "category": "tools", "aliasMap": {"umi-tools-timeis": "timeis", "umi-timeis": "timeis", "umi-waktujakarta": "waktujakarta", "timeis": "timeis", "waktujakarta": "waktujakarta"}, "description": "Cek waktu Jakarta dari time.is", "usage": ".timeis", "example": ".timeis", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/jam.js", metadata, m, extra)
handler.help = ["umi-tools-timeis"]
handler.command = ["umi-tools-timeis", "umi-timeis", "umi-waktujakarta", "timeis", "waktujakarta"]
handler.tags = ["tools"]
handler.description = "Cek waktu Jakarta dari time.is"
handler.importSource = "umi"
handler.importConfig = {"name": "timeis", "alias": ["waktujakarta"], "category": "tools", "description": "Cek waktu Jakarta dari time.is", "usage": ".timeis", "example": ".timeis", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-timeis": "timeis", "umi-timeis": "timeis", "umi-waktujakarta": "waktujakarta", "timeis": "timeis", "waktujakarta": "waktujakarta"}
export default handler
