import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "unreg", "category": "user", "aliasMap": {"umi-user-unreg": "unreg", "umi-unreg": "unreg", "umi-unregister": "unregister", "umi-hapusdaftar": "hapusdaftar", "unregister": "unregister", "hapusdaftar": "hapusdaftar"}, "description": "Hapus data pendaftaran kamu dari bot", "usage": ".unreg", "example": ".unreg", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/unreg.js", metadata, m, extra)
handler.help = ["umi-user-unreg"]
handler.command = ["umi-user-unreg", "umi-unreg", "umi-unregister", "umi-hapusdaftar", "unregister", "hapusdaftar"]
handler.tags = ["user"]
handler.description = "Hapus data pendaftaran kamu dari bot"
handler.importSource = "umi"
handler.importConfig = {"name": "unreg", "alias": ["unregister", "hapusdaftar"], "category": "user", "description": "Hapus data pendaftaran kamu dari bot", "usage": ".unreg", "example": ".unreg", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-unreg": "unreg", "umi-unreg": "unreg", "umi-unregister": "unregister", "umi-hapusdaftar": "hapusdaftar", "unregister": "unregister", "hapusdaftar": "hapusdaftar"}
export default handler
