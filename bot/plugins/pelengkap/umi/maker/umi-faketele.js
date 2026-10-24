/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "faketg", "category": "maker", "aliasMap": {"umi-maker-faketg": "faketg", "umi-faketg": "faketg", "umi-faketele": "faketele", "umi-faketelegram": "faketelegram", "faketg": "faketg", "faketelegram": "faketelegram"}, "description": "Buat gambar tampilan profil Telegram palsu", "usage": ".faketg name|number|bio|username (sambil kirim/reply gambar)", "example": ".faketg Geto|6285135853836|Suguru|Geto suguru", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/faketele.js", metadata, m, extra)
handler.help = ["umi-maker-faketg name|number|bio|username (sambil kirim/reply gambar)"]
handler.command = ["umi-maker-faketg", "umi-faketg", "umi-faketele", "umi-faketelegram", "faketg", "faketelegram"]
handler.tags = ["maker"]
handler.description = "Buat gambar tampilan profil Telegram palsu"
handler.importSource = "umi"
handler.importConfig = {"name": "faketg", "alias": ["faketele", "faketelegram"], "category": "maker", "description": "Buat gambar tampilan profil Telegram palsu", "usage": ".faketg name|number|bio|username (sambil kirim/reply gambar)", "example": ".faketg Geto|6285135853836|Suguru|Geto suguru", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-faketg": "faketg", "umi-faketg": "faketg", "umi-faketele": "faketele", "umi-faketelegram": "faketelegram", "faketg": "faketg", "faketelegram": "faketelegram"}
export default handler
