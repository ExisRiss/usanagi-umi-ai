import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tocodeqr", "category": "tools", "aliasMap": {"umi-tools-tocodeqr": "tocodeqr", "umi-tocodeqr": "tocodeqr", "umi-qrurl": "qrurl", "umi-linktoqr": "linktoqr", "tocodeqr": "tocodeqr", "qrurl": "qrurl", "linktoqr": "linktoqr"}, "description": "Convert link menjadi QR Code", "usage": ".tocodeqr <link>", "example": ".tocodeqr https://youtube.com", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/convert/tocodeqr.js", metadata, m, extra)
handler.help = ["umi-tools-tocodeqr <link>"]
handler.command = ["umi-tools-tocodeqr", "umi-tocodeqr", "umi-qrurl", "umi-linktoqr", "tocodeqr", "qrurl", "linktoqr"]
handler.tags = ["tools"]
handler.description = "Convert link menjadi QR Code"
handler.importSource = "umi"
handler.importConfig = {"name": "tocodeqr", "alias": ["qrurl", "linktoqr"], "category": "tools", "description": "Convert link menjadi QR Code", "usage": ".tocodeqr <link>", "example": ".tocodeqr https://youtube.com", "cooldown": 3, "energi": 0, "isOwner": false, "isGroup": false, "isPrivate": false, "isPremium": false, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-tocodeqr": "tocodeqr", "umi-tocodeqr": "tocodeqr", "umi-qrurl": "qrurl", "umi-linktoqr": "linktoqr", "tocodeqr": "tocodeqr", "qrurl": "qrurl", "linktoqr": "linktoqr"}
export default handler
