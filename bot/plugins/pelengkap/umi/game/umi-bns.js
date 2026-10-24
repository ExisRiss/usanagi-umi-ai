/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "benaratausalah", "category": "game", "aliasMap": {"umi-game-benaratausalah": "benaratausalah", "umi-benaratausalah": "benaratausalah", "umi-bata": "bata", "umi-benarsalah": "benarsalah", "umi-bors": "bors", "benaratausalah": "benaratausalah", "bata": "bata", "benarsalah": "benarsalah", "bors": "bors"}, "description": "Game benar atau salah — jawab pertanyaan dengan 'benar' / 'salah'", "usage": ".benaratausalah", "example": ".benaratausalah", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/bns.js", metadata, m, extra)
handler.help = ["umi-game-benaratausalah"]
handler.command = ["umi-game-benaratausalah", "umi-benaratausalah", "umi-bata", "umi-benarsalah", "umi-bors", "benaratausalah", "bata", "benarsalah", "bors"]
handler.tags = ["game"]
handler.description = "Game benar atau salah — jawab pertanyaan dengan 'benar' / 'salah'"
handler.importSource = "umi"
handler.importConfig = {"name": "benaratausalah", "alias": ["bata", "benarsalah", "bors"], "category": "game", "description": "Game benar atau salah — jawab pertanyaan dengan 'benar' / 'salah'", "usage": ".benaratausalah", "example": ".benaratausalah", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-benaratausalah": "benaratausalah", "umi-benaratausalah": "benaratausalah", "umi-bata": "bata", "umi-benarsalah": "benarsalah", "umi-bors": "bors", "benaratausalah": "benaratausalah", "bata": "bata", "benarsalah": "benarsalah", "bors": "bors"}
export default handler
