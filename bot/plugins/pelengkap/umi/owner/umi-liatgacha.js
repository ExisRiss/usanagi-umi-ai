/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "liatgacha", "category": "owner", "aliasMap": {"umi-owner-liatgacha": "liatgacha", "umi-liatgacha": "liatgacha", "umi-lihat-gacha": "lihat-gacha", "umi-listgacha": "listgacha", "umi-daftargacha": "daftargacha", "umi-lg": "lg", "liatgacha": "liatgacha", "lihat-gacha": "lihat-gacha", "listgacha": "listgacha", "daftargacha": "daftargacha", "lg": "lg"}, "description": "Melihat semua karakter yang tersedia di database gacha", "usage": ".liat-gacha", "example": ".liat-gacha", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/liatgacha.js", metadata, m, extra)
handler.help = ["umi-owner-liatgacha"]
handler.command = ["umi-owner-liatgacha", "umi-liatgacha", "umi-lihat-gacha", "umi-listgacha", "umi-daftargacha", "umi-lg", "liatgacha", "lihat-gacha", "listgacha", "daftargacha", "lg"]
handler.tags = ["owner"]
handler.description = "Melihat semua karakter yang tersedia di database gacha"
handler.importSource = "umi"
handler.importConfig = {"name": "liatgacha", "alias": ["lihat-gacha", "listgacha", "daftargacha", "lg"], "category": "owner", "description": "Melihat semua karakter yang tersedia di database gacha", "usage": ".liat-gacha", "example": ".liat-gacha", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-liatgacha": "liatgacha", "umi-liatgacha": "liatgacha", "umi-lihat-gacha": "lihat-gacha", "umi-listgacha": "listgacha", "umi-daftargacha": "daftargacha", "umi-lg": "lg", "liatgacha": "liatgacha", "lihat-gacha": "lihat-gacha", "listgacha": "listgacha", "daftargacha": "daftargacha", "lg": "lg"}
export default handler
