/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "angrybirds", "category": "game", "aliasMap": {"umi-game-angrybirds": "angrybirds", "umi-angrybirds": "angrybirds", "umi-angrybird": "angrybird", "umi-abirds": "abirds", "angrybirds": "angrybirds", "angrybird": "angrybird", "abirds": "abirds"}, "description": "Angry Birds mini - tembak burung ke target!", "usage": "", "example": ".angrybird", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/angry_birds.js", metadata, m, extra)
handler.help = ["umi-game-angrybirds"]
handler.command = ["umi-game-angrybirds", "umi-angrybirds", "umi-angrybird", "umi-abirds", "angrybirds", "angrybird", "abirds"]
handler.tags = ["game"]
handler.description = "Angry Birds mini - tembak burung ke target!"
handler.importSource = "umi"
handler.importConfig = {"name": "angrybirds", "alias": ["angrybird", "abirds"], "category": "game", "description": "Angry Birds mini - tembak burung ke target!", "usage": "", "example": ".angrybird", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-angrybirds": "angrybirds", "umi-angrybirds": "angrybirds", "umi-angrybird": "angrybird", "umi-abirds": "abirds", "angrybirds": "angrybirds", "angrybird": "angrybird", "abirds": "abirds"}
export default handler
