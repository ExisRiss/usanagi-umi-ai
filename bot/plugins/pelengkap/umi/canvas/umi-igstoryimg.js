/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "igstoryimg", "category": "canvas", "aliasMap": {"umi-canvas-igstoryimg": "igstoryimg", "umi-igstoryimg": "igstoryimg", "umi-igstoryimage": "igstoryimage", "igstoryimg": "igstoryimg", "igstoryimage": "igstoryimage"}, "description": "Membuat gambar layout Instagram Story dari gambarmu.", "usage": ".igstoryimg [kirim/reply gambar]", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/igstoryimg.js", metadata, m, extra)
handler.help = ["umi-canvas-igstoryimg [kirim/reply gambar]"]
handler.command = ["umi-canvas-igstoryimg", "umi-igstoryimg", "umi-igstoryimage", "igstoryimg", "igstoryimage"]
handler.tags = ["canvas"]
handler.description = "Membuat gambar layout Instagram Story dari gambarmu."
handler.importSource = "umi"
handler.importConfig = {"name": "igstoryimg", "alias": ["igstory", "igstoryimage"], "category": "canvas", "description": "Membuat gambar layout Instagram Story dari gambarmu.", "usage": ".igstoryimg [kirim/reply gambar]", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-igstoryimg": "igstoryimg", "umi-igstoryimg": "igstoryimg", "umi-igstoryimage": "igstoryimage", "igstoryimg": "igstoryimg", "igstoryimage": "igstoryimage"}
export default handler
