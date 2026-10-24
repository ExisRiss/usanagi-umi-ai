/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "donasi", "category": "main", "aliasMap": {"umi-main-donasi": "donasi", "umi-donasi": "donasi", "umi-donate": "donate", "umi-donation": "donation", "umi-support": "support", "umi-saweria": "saweria", "umi-trakteer": "trakteer", "donate": "donate", "donation": "donation", "support": "support", "saweria": "saweria", "trakteer": "trakteer"}, "description": "Informasi donasi untuk mendukung bot dengan QRIS", "usage": ".donasi", "example": ".donasi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/donasi.js", metadata, m, extra)
handler.help = ["umi-main-donasi"]
handler.command = ["umi-main-donasi", "umi-donasi", "umi-donate", "umi-donation", "umi-support", "umi-saweria", "umi-trakteer", "donate", "donation", "support", "saweria", "trakteer"]
handler.tags = ["main"]
handler.description = "Informasi donasi untuk mendukung bot dengan QRIS"
handler.importSource = "umi"
handler.importConfig = {"name": "donasi", "alias": ["donate", "donation", "support", "saweria", "trakteer"], "category": "main", "description": "Informasi donasi untuk mendukung bot dengan QRIS", "usage": ".donasi", "example": ".donasi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-donasi": "donasi", "umi-donasi": "donasi", "umi-donate": "donate", "umi-donation": "donation", "umi-support": "support", "umi-saweria": "saweria", "umi-trakteer": "trakteer", "donate": "donate", "donation": "donation", "support": "support", "saweria": "saweria", "trakteer": "trakteer"}
export default handler
