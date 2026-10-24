/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "txt2qr", "category": "tools", "aliasMap": {"umi-tools-txt2qr": "txt2qr", "umi-txt2qr": "txt2qr", "umi-texttoqr": "texttoqr", "umi-qrcode": "qrcode", "umi-qrcreate": "qrcreate", "txt2qr": "txt2qr", "texttoqr": "texttoqr", "qrcreate": "qrcreate"}, "description": "Generate QR code dari teks", "usage": ".txt2qr <text>", "example": ".txt2qr https://google.com", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/txt2qr.js", metadata, m, extra)
handler.help = ["umi-tools-txt2qr <text>"]
handler.command = ["umi-tools-txt2qr", "umi-txt2qr", "umi-texttoqr", "umi-qrcode", "umi-qrcreate", "txt2qr", "texttoqr", "qrcreate"]
handler.tags = ["tools"]
handler.description = "Generate QR code dari teks"
handler.importSource = "umi"
handler.importConfig = {"name": "txt2qr", "alias": ["texttoqr", "qrcode", "qrcreate"], "category": "tools", "description": "Generate QR code dari teks", "usage": ".txt2qr <text>", "example": ".txt2qr https://google.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-txt2qr": "txt2qr", "umi-txt2qr": "txt2qr", "umi-texttoqr": "texttoqr", "umi-qrcode": "qrcode", "umi-qrcreate": "qrcreate", "txt2qr": "txt2qr", "texttoqr": "texttoqr", "qrcreate": "qrcreate"}
export default handler
