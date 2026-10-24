/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ptvch", "category": "owner", "aliasMap": {"umi-owner-ptvch": "ptvch", "umi-ptvch": "ptvch", "umi-ptvchanel": "ptvchanel", "umi-ptvstory": "ptvstory", "ptvch": "ptvch", "ptvchanel": "ptvchanel", "ptvstory": "ptvstory"}, "description": "Kirim video sebagai PTV ke channel", "usage": ".ptvch (reply video)", "example": ".ptvch", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/ptvch.js", metadata, m, extra)
handler.help = ["umi-owner-ptvch (reply video)"]
handler.command = ["umi-owner-ptvch", "umi-ptvch", "umi-ptvchanel", "umi-ptvstory", "ptvch", "ptvchanel", "ptvstory"]
handler.tags = ["owner"]
handler.description = "Kirim video sebagai PTV ke channel"
handler.importSource = "umi"
handler.importConfig = {"name": "ptvch", "alias": ["ptvchanel", "ptvstory"], "category": "owner", "description": "Kirim video sebagai PTV ke channel", "usage": ".ptvch (reply video)", "example": ".ptvch", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-ptvch": "ptvch", "umi-ptvch": "ptvch", "umi-ptvchanel": "ptvchanel", "umi-ptvstory": "ptvstory", "ptvch": "ptvch", "ptvchanel": "ptvchanel", "ptvstory": "ptvstory"}
export default handler
