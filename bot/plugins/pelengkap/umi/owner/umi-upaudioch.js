/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "upaudioch", "category": "owner", "aliasMap": {"umi-owner-upaudioch": "upaudioch", "umi-upaudioch": "upaudioch", "umi-tovnsaluran": "tovnsaluran", "umi-uploadaudioch": "uploadaudioch", "umi-upaudiosaluran": "upaudiosaluran", "upaudioch": "upaudioch", "tovnsaluran": "tovnsaluran", "uploadaudioch": "uploadaudioch", "upaudiosaluran": "upaudiosaluran"}, "description": "Upload audio ke saluran (channel) WhatsApp", "usage": ".upaudioch (reply audio) <teks>", "example": ".upaudioch Pesan dari owner", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/upaudioch.js", metadata, m, extra)
handler.help = ["umi-owner-upaudioch (reply audio) <teks>"]
handler.command = ["umi-owner-upaudioch", "umi-upaudioch", "umi-tovnsaluran", "umi-uploadaudioch", "umi-upaudiosaluran", "upaudioch", "tovnsaluran", "uploadaudioch", "upaudiosaluran"]
handler.tags = ["owner"]
handler.description = "Upload audio ke saluran (channel) WhatsApp"
handler.importSource = "umi"
handler.importConfig = {"name": "upaudioch", "alias": ["tovnsaluran", "uploadaudioch", "upaudiosaluran"], "category": "owner", "description": "Upload audio ke saluran (channel) WhatsApp", "usage": ".upaudioch (reply audio) <teks>", "example": ".upaudioch Pesan dari owner", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-upaudioch": "upaudioch", "umi-upaudioch": "upaudioch", "umi-tovnsaluran": "tovnsaluran", "umi-uploadaudioch": "uploadaudioch", "umi-upaudiosaluran": "upaudiosaluran", "upaudioch": "upaudioch", "tovnsaluran": "tovnsaluran", "uploadaudioch": "uploadaudioch", "upaudiosaluran": "upaudiosaluran"}
export default handler
