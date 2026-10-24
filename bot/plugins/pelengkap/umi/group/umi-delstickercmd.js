/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delstickercmd", "category": "group", "aliasMap": {"umi-group-delstickercmd": "delstickercmd", "umi-delstickercmd": "delstickercmd", "umi-delcmdsticker": "delcmdsticker", "umi-removesticker": "removesticker", "umi-unsticker": "unsticker", "delstickercmd": "delstickercmd", "delcmdsticker": "delcmdsticker", "removesticker": "removesticker", "unsticker": "unsticker"}, "description": "Hapus sticker command", "usage": ".delstickercmd <command> atau reply sticker", "example": ".delstickercmd menu", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/delstickercmd.js", metadata, m, extra)
handler.help = ["umi-group-delstickercmd <command> atau reply sticker"]
handler.command = ["umi-group-delstickercmd", "umi-delstickercmd", "umi-delcmdsticker", "umi-removesticker", "umi-unsticker", "delstickercmd", "delcmdsticker", "removesticker", "unsticker"]
handler.tags = ["group"]
handler.description = "Hapus sticker command"
handler.importSource = "umi"
handler.importConfig = {"name": "delstickercmd", "alias": ["delcmdsticker", "removesticker", "unsticker"], "category": "group", "description": "Hapus sticker command", "usage": ".delstickercmd <command> atau reply sticker", "example": ".delstickercmd menu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "isAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-delstickercmd": "delstickercmd", "umi-delstickercmd": "delstickercmd", "umi-delcmdsticker": "delcmdsticker", "umi-removesticker": "removesticker", "umi-unsticker": "unsticker", "delstickercmd": "delstickercmd", "delcmdsticker": "delcmdsticker", "removesticker": "removesticker", "unsticker": "unsticker"}
export default handler
