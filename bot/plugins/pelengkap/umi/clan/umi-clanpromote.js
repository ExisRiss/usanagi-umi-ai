/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanpromote", "category": "clan", "aliasMap": {"umi-clan-clanpromote": "clanpromote", "umi-clanpromote": "clanpromote", "umi-promoteclan": "promoteclan", "umi-setcoleader": "setcoleader", "clanpromote": "clanpromote", "promoteclan": "promoteclan", "setcoleader": "setcoleader"}, "description": "Naikkan jabatan member (Co-Leader/Elder)", "usage": ".clanpromote @user <coleader|elder>", "example": ".clanpromote @user coleader", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanpromote.js", metadata, m, extra)
handler.help = ["umi-clan-clanpromote @user <coleader|elder>"]
handler.command = ["umi-clan-clanpromote", "umi-clanpromote", "umi-promoteclan", "umi-setcoleader", "clanpromote", "promoteclan", "setcoleader"]
handler.tags = ["clan"]
handler.description = "Naikkan jabatan member (Co-Leader/Elder)"
handler.importSource = "umi"
handler.importConfig = {"name": "clanpromote", "alias": ["promoteclan", "setcoleader"], "category": "clan", "description": "Naikkan jabatan member (Co-Leader/Elder)", "usage": ".clanpromote @user <coleader|elder>", "example": ".clanpromote @user coleader", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanpromote": "clanpromote", "umi-clanpromote": "clanpromote", "umi-promoteclan": "promoteclan", "umi-setcoleader": "setcoleader", "clanpromote": "clanpromote", "promoteclan": "promoteclan", "setcoleader": "setcoleader"}
export default handler
