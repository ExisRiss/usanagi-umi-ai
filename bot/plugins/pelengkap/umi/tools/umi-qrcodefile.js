import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "qrcodefile", "category": "tools", "aliasMap": {"umi-tools-qrcodefile": "qrcodefile", "umi-qrcodefile": "qrcodefile", "umi-qrfile": "qrfile", "umi-fileqr": "fileqr", "umi-filetoqr": "filetoqr", "umi-qruguu": "qruguu", "qrcodefile": "qrcodefile", "qrfile": "qrfile", "fileqr": "fileqr", "filetoqr": "filetoqr", "qruguu": "qruguu"}, "description": "Mengupload media/file ke Uguu.se dan membuat QR Code berisi URL file tersebut", "usage": ".qrcodefile (kirim dengan caption atau reply media/file/viewonce/dokumen)", "example": ".qrcodefile", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/qrcodefile.js", metadata, m, extra)
handler.help = ["umi-tools-qrcodefile (kirim dengan caption atau reply media/file/viewonce/dokumen)"]
handler.command = ["umi-tools-qrcodefile", "umi-qrcodefile", "umi-qrfile", "umi-fileqr", "umi-filetoqr", "umi-qruguu", "qrcodefile", "qrfile", "fileqr", "filetoqr", "qruguu"]
handler.tags = ["tools"]
handler.description = "Mengupload media/file ke Uguu.se dan membuat QR Code berisi URL file tersebut"
handler.importSource = "umi"
handler.importConfig = {"name": "qrcodefile", "alias": ["qrfile", "fileqr", "filetoqr", "qruguu"], "category": "tools", "description": "Mengupload media/file ke Uguu.se dan membuat QR Code berisi URL file tersebut", "usage": ".qrcodefile (kirim dengan caption atau reply media/file/viewonce/dokumen)", "example": ".qrcodefile", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-qrcodefile": "qrcodefile", "umi-qrcodefile": "qrcodefile", "umi-qrfile": "qrfile", "umi-fileqr": "fileqr", "umi-filetoqr": "filetoqr", "umi-qruguu": "qruguu", "qrcodefile": "qrcodefile", "qrfile": "qrfile", "fileqr": "fileqr", "filetoqr": "filetoqr", "qruguu": "qruguu"}
export default handler
