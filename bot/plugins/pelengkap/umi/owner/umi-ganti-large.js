/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "umi-large", "category": "owner", "aliasMap": {"umi-owner-umi-large": "umi-large", "umi-large": "umi-large", "umi-setumilarge": "setumilarge", "umi-gantiumilarge": "gantiumilarge", "umi-large": "large", "setumilarge": "setumilarge", "gantiumilarge": "gantiumilarge"}, "description": "Preset: Ganti gambar umi.jpg, serta umi-v7 hingga umi-v11.jpg sekaligus", "usage": ".umi-large (reply/kirim gambar)", "example": ".umi-large", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/ganti-rimuru-large.js", metadata, m, extra)
handler.help = ["umi-owner-umi-large (reply/kirim gambar)"]
handler.command = ["umi-owner-umi-large", "umi-large", "umi-setumilarge", "umi-gantiumilarge", "setumilarge", "gantiumilarge"]
handler.tags = ["owner"]
handler.description = "Preset: Ganti gambar umi.jpg, serta umi-v7 hingga umi-v11.jpg sekaligus"
handler.importSource = "umi"
handler.importConfig = {"name": "umi-large", "alias": ["setumilarge", "gantiumilarge"], "category": "owner", "description": "Preset: Ganti gambar umi.jpg, serta umi-v7 hingga umi-v11.jpg sekaligus", "usage": ".umi-large (reply/kirim gambar)", "example": ".umi-large", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-umi-large": "umi-large", "umi-large": "umi-large", "umi-setumilarge": "setumilarge", "umi-gantiumilarge": "gantiumilarge", "umi-large": "large", "setumilarge": "setumilarge", "gantiumilarge": "gantiumilarge"}
export default handler
