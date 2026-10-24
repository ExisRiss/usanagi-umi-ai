/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "join", "category": "owner", "aliasMap": {"umi-owner-join": "join", "umi-join": "join", "umi-joingrup": "joingrup", "umi-joingroup": "joingroup", "umi-gabung": "gabung", "join": "join", "joingrup": "joingrup", "joingroup": "joingroup", "gabung": "gabung"}, "description": "Bot join ke grup via link invite, support reply pesan yang mengandung link", "usage": ".join <link> / .join (reply pesan berisi link)", "example": ".join https://chat.whatsapp.com/xxx", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/join.js", metadata, m, extra)
handler.help = ["umi-owner-join <link> / .join (reply pesan berisi link)"]
handler.command = ["umi-owner-join", "umi-join", "umi-joingrup", "umi-joingroup", "umi-gabung", "join", "joingrup", "joingroup", "gabung"]
handler.tags = ["owner"]
handler.description = "Bot join ke grup via link invite, support reply pesan yang mengandung link"
handler.importSource = "umi"
handler.importConfig = {"name": "join", "alias": ["joingrup", "joingroup", "gabung"], "category": "owner", "description": "Bot join ke grup via link invite, support reply pesan yang mengandung link", "usage": ".join <link> / .join (reply pesan berisi link)", "example": ".join https://chat.whatsapp.com/xxx", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-join": "join", "umi-join": "join", "umi-joingrup": "joingrup", "umi-joingroup": "joingroup", "umi-gabung": "gabung", "join": "join", "joingrup": "joingrup", "joingroup": "joingroup", "gabung": "gabung"}
export default handler
