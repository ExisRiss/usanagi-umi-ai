import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "suitpvp", "category": "game", "aliasMap": {"umi-game-suitpvp": "suitpvp", "umi-suitpvp": "suitpvp", "umi-suit": "suit", "umi-rps": "rps", "umi-janken": "janken", "suit": "suit", "rps": "rps", "janken": "janken"}, "description": "Main suit (batu gunting kertas) dengan player lain", "usage": ".suit @tag", "example": ".suit @628xxx", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/suitpvp.js", metadata, m, extra)
handler.help = ["umi-game-suitpvp @tag"]
handler.command = ["umi-game-suitpvp", "umi-suitpvp", "umi-suit", "umi-rps", "umi-janken", "suit", "rps", "janken"]
handler.tags = ["game"]
handler.description = "Main suit (batu gunting kertas) dengan player lain"
handler.importSource = "umi"
handler.importConfig = {"name": "suitpvp", "alias": ["suit", "rps", "janken"], "category": "game", "description": "Main suit (batu gunting kertas) dengan player lain", "usage": ".suit @tag", "example": ".suit @628xxx", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-suitpvp": "suitpvp", "umi-suitpvp": "suitpvp", "umi-suit": "suit", "umi-rps": "rps", "umi-janken": "janken", "suit": "suit", "rps": "rps", "janken": "janken"}
export default handler
