/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cektiktok", "category": "stalker", "aliasMap": {"umi-stalker-cektiktok": "cektiktok", "umi-cektiktok": "cektiktok", "umi-cekakuntt": "cekakuntt", "umi-cektt": "cektt", "cektiktok": "cektiktok", "cekakuntt": "cekakuntt"}, "description": "Cek informasi akun TikTok (terdaftar atau manual)", "usage": ".cektt <username>", "example": ".cektt faizprst7", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/cekakuntt.js", metadata, m, extra)
handler.help = ["umi-stalker-cektiktok <username>"]
handler.command = ["umi-stalker-cektiktok", "umi-cektiktok", "umi-cekakuntt", "umi-cektt", "cektiktok", "cekakuntt"]
handler.tags = ["stalker"]
handler.description = "Cek informasi akun TikTok (terdaftar atau manual)"
handler.importSource = "umi"
handler.importConfig = {"name": "cektiktok", "alias": ["cekakuntt", "cektt", "cektiktok"], "category": "stalker", "description": "Cek informasi akun TikTok (terdaftar atau manual)", "usage": ".cektt <username>", "example": ".cektt faizprst7", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-cektiktok": "cektiktok", "umi-cektiktok": "cektiktok", "umi-cekakuntt": "cekakuntt", "umi-cektt": "cektt", "cektiktok": "cektiktok", "cekakuntt": "cekakuntt"}
export default handler
