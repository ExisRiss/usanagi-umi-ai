/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "spongebob", "category": "canvas", "aliasMap": {"umi-canvas-spongebob": "spongebob", "umi-spongebob": "spongebob", "spongebob": "spongebob"}, "description": "Buat meme SpongeBob", "usage": ".spongebob <teks>", "example": ".spongebob Wahai kerang ajaib", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/spongebob.js", metadata, m, extra)
handler.help = ["umi-canvas-spongebob <teks>"]
handler.command = ["umi-canvas-spongebob", "umi-spongebob", "spongebob"]
handler.tags = ["canvas"]
handler.description = "Buat meme SpongeBob"
handler.importSource = "umi"
handler.importConfig = {"name": "spongebob", "alias": ["spongebob"], "category": "canvas", "description": "Buat meme SpongeBob", "usage": ".spongebob <teks>", "example": ".spongebob Wahai kerang ajaib", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-spongebob": "spongebob", "umi-spongebob": "spongebob", "spongebob": "spongebob"}
export default handler
