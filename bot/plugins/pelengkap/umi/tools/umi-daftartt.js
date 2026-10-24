/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "daftartiktok", "category": "stalker", "aliasMap": {"umi-stalker-daftartiktok": "daftartiktok", "umi-daftartiktok": "daftartiktok", "umi-daftartt": "daftartt", "umi-regtt": "regtt", "daftartiktok": "daftartiktok", "daftartt": "daftartt", "regtt": "regtt"}, "description": "Mendaftarkan username TikTok ke database user", "usage": ".daftartt <username>", "example": ".daftartt faizprst7", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/daftartt.js", metadata, m, extra)
handler.help = ["umi-stalker-daftartiktok <username>"]
handler.command = ["umi-stalker-daftartiktok", "umi-daftartiktok", "umi-daftartt", "umi-regtt", "daftartiktok", "daftartt", "regtt"]
handler.tags = ["stalker"]
handler.description = "Mendaftarkan username TikTok ke database user"
handler.importSource = "umi"
handler.importConfig = {"name": "daftartiktok", "alias": ["daftartt", "regtt"], "category": "stalker", "description": "Mendaftarkan username TikTok ke database user", "usage": ".daftartt <username>", "example": ".daftartt faizprst7", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-daftartiktok": "daftartiktok", "umi-daftartiktok": "daftartiktok", "umi-daftartt": "daftartt", "umi-regtt": "regtt", "daftartiktok": "daftartiktok", "daftartt": "daftartt", "regtt": "regtt"}
export default handler
