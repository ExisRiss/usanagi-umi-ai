import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "web2apk", "category": "maker", "aliasMap": {"umi-maker-web2apk": "web2apk", "umi-web2apk": "web2apk", "umi-appmaker": "appmaker", "umi-makeapk": "makeapk", "umi-tobuildapk": "tobuildapk", "web2apk": "web2apk", "appmaker": "appmaker", "makeapk": "makeapk", "tobuildapk": "tobuildapk"}, "description": "Mengubah URL Website menjadi Aplikasi Android (.apk)", "usage": ".web2apk NamaApp | URL | Email (balas foto untuk icon/splash)", "example": ".web2apk KitsuLabs | https://www.kitsulabs.xyz | user@gmail.com", "cooldown": 30, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/appmaker.js", metadata, m, extra)
handler.help = ["umi-maker-web2apk NamaApp | URL | Email (balas foto untuk icon/splash)"]
handler.command = ["umi-maker-web2apk", "umi-web2apk", "umi-appmaker", "umi-makeapk", "umi-tobuildapk", "web2apk", "appmaker", "makeapk", "tobuildapk"]
handler.tags = ["maker"]
handler.description = "Mengubah URL Website menjadi Aplikasi Android (.apk)"
handler.importSource = "umi"
handler.importConfig = {"name": "web2apk", "alias": ["appmaker", "makeapk", "tobuildapk"], "category": "maker", "description": "Mengubah URL Website menjadi Aplikasi Android (.apk)", "usage": ".web2apk NamaApp | URL | Email (balas foto untuk icon/splash)", "example": ".web2apk KitsuLabs | https://www.kitsulabs.xyz | user@gmail.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-web2apk": "web2apk", "umi-web2apk": "web2apk", "umi-appmaker": "appmaker", "umi-makeapk": "makeapk", "umi-tobuildapk": "tobuildapk", "web2apk": "web2apk", "appmaker": "appmaker", "makeapk": "makeapk", "tobuildapk": "tobuildapk"}
export default handler
