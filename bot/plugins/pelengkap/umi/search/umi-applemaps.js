import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "applemaps", "category": "search", "aliasMap": {"umi-search-applemaps": "applemaps", "umi-applemaps": "applemaps", "umi-maps": "maps", "umi-applemap": "applemap", "umi-carilokasi": "carilokasi", "applemaps": "applemaps", "maps": "maps", "applemap": "applemap", "carilokasi": "carilokasi"}, "description": "Cari lokasi dan detail tempat menggunakan Apple Maps", "usage": ".applemaps <nama_tempat/lokasi>", "example": ".applemaps Indonesia", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/applemaps.js", metadata, m, extra)
handler.help = ["umi-search-applemaps <nama_tempat/lokasi>"]
handler.command = ["umi-search-applemaps", "umi-applemaps", "umi-maps", "umi-applemap", "umi-carilokasi", "applemaps", "maps", "applemap", "carilokasi"]
handler.tags = ["search"]
handler.description = "Cari lokasi dan detail tempat menggunakan Apple Maps"
handler.importSource = "umi"
handler.importConfig = {"name": "applemaps", "alias": ["maps", "applemap", "carilokasi"], "category": "search", "description": "Cari lokasi dan detail tempat menggunakan Apple Maps", "usage": ".applemaps <nama_tempat/lokasi>", "example": ".applemaps Indonesia", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-applemaps": "applemaps", "umi-applemaps": "applemaps", "umi-maps": "maps", "umi-applemap": "applemap", "umi-carilokasi": "carilokasi", "applemaps": "applemaps", "maps": "maps", "applemap": "applemap", "carilokasi": "carilokasi"}
export default handler
