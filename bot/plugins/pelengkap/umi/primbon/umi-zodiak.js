/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "zodiak", "category": "primbon", "aliasMap": {"umi-primbon-zodiak": "zodiak", "umi-zodiak": "zodiak", "umi-horoscope": "horoscope", "umi-ramalan": "ramalan", "zodiak": "zodiak", "horoscope": "horoscope"}, "description": "Ramalan zodiak", "usage": ".zodiak <nama zodiak>", "example": ".zodiak aries", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/primbon/zodiak.js", metadata, m, extra)
handler.help = ["umi-primbon-zodiak <nama zodiak>"]
handler.command = ["umi-primbon-zodiak", "umi-zodiak", "umi-horoscope", "umi-ramalan", "zodiak", "horoscope"]
handler.tags = ["primbon"]
handler.description = "Ramalan zodiak"
handler.importSource = "umi"
handler.importConfig = {"name": "zodiak", "alias": ["horoscope", "ramalan"], "category": "primbon", "description": "Ramalan zodiak", "usage": ".zodiak <nama zodiak>", "example": ".zodiak aries", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-primbon-zodiak": "zodiak", "umi-zodiak": "zodiak", "umi-horoscope": "horoscope", "umi-ramalan": "ramalan", "zodiak": "zodiak", "horoscope": "horoscope"}
export default handler
