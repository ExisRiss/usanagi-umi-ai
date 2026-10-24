import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "barcode", "category": "tools", "aliasMap": {"umi-tools-barcode": "barcode", "umi-barcode": "barcode", "umi-code128": "code128", "code128": "code128"}, "description": "Membuat barcode Code-128", "usage": ".barcode <teks>", "example": ".barcode 1234567890", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/barcode.js", metadata, m, extra)
handler.help = ["umi-tools-barcode <teks>"]
handler.command = ["umi-tools-barcode", "umi-barcode", "umi-code128", "code128"]
handler.tags = ["tools"]
handler.description = "Membuat barcode Code-128"
handler.importSource = "umi"
handler.importConfig = {"name": "barcode", "alias": ["code128"], "category": "tools", "description": "Membuat barcode Code-128", "usage": ".barcode <teks>", "example": ".barcode 1234567890", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-barcode": "barcode", "umi-barcode": "barcode", "umi-code128": "code128", "code128": "code128"}
export default handler
