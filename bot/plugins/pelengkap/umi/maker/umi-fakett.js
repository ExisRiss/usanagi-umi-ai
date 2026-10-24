import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakett", "category": "maker", "aliasMap": {"umi-maker-fakett": "fakett", "umi-fakett": "fakett", "umi-faketiktok": "faketiktok", "umi-fakettprofile": "fakettprofile", "fakett": "fakett", "faketiktok": "faketiktok", "fakettprofile": "fakettprofile"}, "description": "Buat gambar tampilan profil TikTok palsu", "usage": ".fakett nama|username|verified|mengikuti|pengikut|suka|bio (sambil kirim/reply gambar)", "example": ".fakett Tes|Tes1|false|10|100|1000|Bio Saya", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakett.js", metadata, m, extra)
handler.help = ["umi-maker-fakett nama|username|verified|mengikuti|pengikut|suka|bio (sambil kirim/reply gambar)"]
handler.command = ["umi-maker-fakett", "umi-fakett", "umi-faketiktok", "umi-fakettprofile", "fakett", "faketiktok", "fakettprofile"]
handler.tags = ["maker"]
handler.description = "Buat gambar tampilan profil TikTok palsu"
handler.importSource = "umi"
handler.importConfig = {"name": "fakett", "alias": ["faketiktok", "fakettprofile"], "category": "maker", "description": "Buat gambar tampilan profil TikTok palsu", "usage": ".fakett nama|username|verified|mengikuti|pengikut|suka|bio (sambil kirim/reply gambar)", "example": ".fakett Tes|Tes1|false|10|100|1000|Bio Saya", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakett": "fakett", "umi-fakett": "fakett", "umi-faketiktok": "faketiktok", "umi-fakettprofile": "fakettprofile", "fakett": "fakett", "faketiktok": "faketiktok", "fakettprofile": "fakettprofile"}
export default handler
