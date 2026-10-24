/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "family100", "category": "game", "aliasMap": {"umi-game-family100": "family100", "umi-family100": "family100", "umi-f100": "f100", "f100": "f100", "survei": "survei"}, "description": "Survey says! Tebak jawaban teratas survei", "usage": ".family100", "example": ".family100", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/family100.js", metadata, m, extra)
handler.help = ["umi-game-family100"]
handler.command = ["umi-game-family100", "umi-family100", "umi-f100", "f100", "survei"]
handler.tags = ["game"]
handler.description = "Survey says! Tebak jawaban teratas survei"
handler.importSource = "umi"
handler.importConfig = {"name": "family100", "alias": ["f100", "survei"], "category": "game", "description": "Survey says! Tebak jawaban teratas survei", "usage": ".family100", "example": ".family100", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-family100": "family100", "umi-family100": "family100", "umi-f100": "f100", "f100": "f100", "survei": "survei"}
export default handler
