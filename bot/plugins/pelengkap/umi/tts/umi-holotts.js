/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "holotts", "category": "tts", "aliasMap": {"umi-tts-holotts": "holotts", "umi-holotts": "holotts", "umi-hololive": "hololive", "umi-hololivetts": "hololivetts", "umi-vnholo": "vnholo", "holotts": "holotts", "hololive": "hololive", "hololivetts": "hololivetts", "vnholo": "vnholo"}, "description": "TTS suara karakter Hololive via RVC Hugging Face", "usage": ".holotts <karakter>|<teks>", "example": ".holotts roboco|Hello Umi!", "cooldown": 15, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tts/holotts.js", metadata, m, extra)
handler.help = ["umi-tts-holotts <karakter>|<teks>"]
handler.command = ["umi-tts-holotts", "umi-holotts", "umi-hololive", "umi-hololivetts", "umi-vnholo", "holotts", "hololive", "hololivetts", "vnholo"]
handler.tags = ["tts"]
handler.description = "TTS suara karakter Hololive via RVC Hugging Face"
handler.importSource = "umi"
handler.importConfig = {"name": "holotts", "alias": ["hololive", "hololivetts", "vnholo"], "category": "tts", "description": "TTS suara karakter Hololive via RVC Hugging Face", "usage": ".holotts <karakter>|<teks>", "example": ".holotts roboco|Hello Umi!", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tts-holotts": "holotts", "umi-holotts": "holotts", "umi-hololive": "hololive", "umi-hololivetts": "hololivetts", "umi-vnholo": "vnholo", "holotts": "holotts", "hololive": "hololive", "hololivetts": "hololivetts", "vnholo": "vnholo"}
export default handler
