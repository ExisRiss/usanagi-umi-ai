/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeidcard", "category": "canvas", "aliasMap": {"umi-canvas-fakeidcard": "fakeidcard", "umi-fakeidcard": "fakeidcard", "umi-idcardfake": "idcardfake", "umi-faketanda": "faketanda", "fakeidcard": "fakeidcard", "idcardfake": "idcardfake", "faketanda": "faketanda"}, "description": "Bikin fake ID Card (buat konten/gaguan doang)", "usage": ".fakeidcard <nama> | <jabatan>", "example": ".fakeidcard Umi | CEO", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeidcard.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeidcard <nama> | <jabatan>"]
handler.command = ["umi-canvas-fakeidcard", "umi-fakeidcard", "umi-idcardfake", "umi-faketanda", "fakeidcard", "idcardfake", "faketanda"]
handler.tags = ["canvas"]
handler.description = "Bikin fake ID Card (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeidcard", "alias": ["idcardfake", "faketanda", "faketanda pengenal"], "category": "canvas", "description": "Bikin fake ID Card (buat konten/gaguan doang)", "usage": ".fakeidcard <nama> | <jabatan>", "example": ".fakeidcard Umi | CEO", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeidcard": "fakeidcard", "umi-fakeidcard": "fakeidcard", "umi-idcardfake": "idcardfake", "umi-faketanda": "faketanda", "fakeidcard": "fakeidcard", "idcardfake": "idcardfake", "faketanda": "faketanda"}
export default handler
