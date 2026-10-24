/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "surah2", "category": "general", "aliasMap": {"umi-general-surah2": "surah2", "umi-surah2": "surah2", "surah2": "surah2"}, "description": "Pencarian surah lengkap dengan Arab, bacaan, dan arti.", "usage": ".surah2 <nama/nomor>", "example": ".surah2 <nama/nomor>", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/surah.js", metadata, m, extra)
handler.help = ["umi-general-surah2 <nama/nomor>"]
handler.command = ["umi-general-surah2", "umi-surah2", "surah2"]
handler.tags = ["general"]
handler.description = "Pencarian surah lengkap dengan Arab, bacaan, dan arti."
handler.importSource = "umi"
handler.importConfig = {"name": "surah2", "alias": [], "category": "general", "description": "Pencarian surah lengkap dengan Arab, bacaan, dan arti.", "usage": ".surah2 <nama/nomor>", "example": ".surah2 <nama/nomor>", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-general-surah2": "surah2", "umi-surah2": "surah2", "surah2": "surah2"}
export default handler
