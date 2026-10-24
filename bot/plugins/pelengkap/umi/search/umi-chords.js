/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "chords", "category": "search", "aliasMap": {"umi-search-chords": "chords", "umi-chords": "chords", "umi-chord": "chord", "umi-kunci": "kunci", "umi-kuncigitar": "kuncigitar", "chords": "chords", "chord": "chord", "kunci": "kunci", "kuncigitar": "kuncigitar"}, "description": "Cari chord/kunci gitar lagu", "usage": ".chords <judul lagu>", "example": ".chords komang", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/chords.js", metadata, m, extra)
handler.help = ["umi-search-chords <judul lagu>"]
handler.command = ["umi-search-chords", "umi-chords", "umi-chord", "umi-kunci", "umi-kuncigitar", "chords", "chord", "kunci", "kuncigitar"]
handler.tags = ["search"]
handler.description = "Cari chord/kunci gitar lagu"
handler.importSource = "umi"
handler.importConfig = {"name": "chords", "alias": ["chord", "kunci", "kuncigitar"], "category": "search", "description": "Cari chord/kunci gitar lagu", "usage": ".chords <judul lagu>", "example": ".chords komang", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-chords": "chords", "umi-chords": "chords", "umi-chord": "chord", "umi-kunci": "kunci", "umi-kuncigitar": "kuncigitar", "chords": "chords", "chord": "chord", "kunci": "kunci", "kuncigitar": "kuncigitar"}
export default handler
