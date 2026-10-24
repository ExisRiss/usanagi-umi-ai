/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "savekontak", "category": "owner", "aliasMap": {"umi-owner-savekontak": "savekontak", "umi-savekontak": "savekontak", "umi-sv": "sv", "umi-svkontak": "svkontak", "savekontak": "savekontak", "sv": "sv", "svkontak": "svkontak"}, "description": "Menyimpan kontak dari grup menjadi file VCF", "usage": ".savekontak <nama>", "example": ".savekontak Fulan", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/savekontak.js", metadata, m, extra)
handler.help = ["umi-owner-savekontak <nama>"]
handler.command = ["umi-owner-savekontak", "umi-savekontak", "umi-sv", "umi-svkontak", "savekontak", "sv", "svkontak"]
handler.tags = ["owner"]
handler.description = "Menyimpan kontak dari grup menjadi file VCF"
handler.importSource = "umi"
handler.importConfig = {"name": "savekontak", "alias": ["sv", "svkontak"], "category": "owner", "description": "Menyimpan kontak dari grup menjadi file VCF", "usage": ".savekontak <nama>", "example": ".savekontak Fulan", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-savekontak": "savekontak", "umi-savekontak": "savekontak", "umi-sv": "sv", "umi-svkontak": "svkontak", "savekontak": "savekontak", "sv": "sv", "svkontak": "svkontak"}
export default handler
