/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "superhero", "category": "random", "aliasMap": {"umi-random-superhero": "superhero", "umi-superhero": "superhero", "umi-hero": "hero", "umi-pahlawan": "pahlawan", "superhero": "superhero", "hero": "hero", "pahlawan": "pahlawan"}, "description": "Cari informasi superhero", "usage": ".superhero <nama>", "example": ".superhero batman", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/superhero.js", metadata, m, extra)
handler.help = ["umi-random-superhero <nama>"]
handler.command = ["umi-random-superhero", "umi-superhero", "umi-hero", "umi-pahlawan", "superhero", "hero", "pahlawan"]
handler.tags = ["random"]
handler.description = "Cari informasi superhero"
handler.importSource = "umi"
handler.importConfig = {"name": "superhero", "alias": ["hero", "pahlawan"], "category": "random", "description": "Cari informasi superhero", "usage": ".superhero <nama>", "example": ".superhero batman", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-random-superhero": "superhero", "umi-superhero": "superhero", "umi-hero": "hero", "umi-pahlawan": "pahlawan", "superhero": "superhero", "hero": "hero", "pahlawan": "pahlawan"}
export default handler
