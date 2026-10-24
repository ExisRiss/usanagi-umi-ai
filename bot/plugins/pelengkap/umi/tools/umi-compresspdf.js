import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "compresspdf", "category": "tools", "aliasMap": {"umi-tools-compresspdf": "compresspdf", "umi-compresspdf": "compresspdf", "umi-komprespdf": "komprespdf", "umi-pdfcompress": "pdfcompress", "compresspdf": "compresspdf", "komprespdf": "komprespdf", "pdfcompress": "pdfcompress"}, "description": "Mengompres file PDF", "usage": ".compresspdf <reply/kirim PDF>", "example": ".compresspdf", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/compresspdf.js", metadata, m, extra)
handler.help = ["umi-tools-compresspdf <reply/kirim PDF>"]
handler.command = ["umi-tools-compresspdf", "umi-compresspdf", "umi-komprespdf", "umi-pdfcompress", "compresspdf", "komprespdf", "pdfcompress"]
handler.tags = ["tools"]
handler.description = "Mengompres file PDF"
handler.importSource = "umi"
handler.importConfig = {"name": "compresspdf", "alias": ["komprespdf", "pdfcompress"], "category": "tools", "description": "Mengompres file PDF", "usage": ".compresspdf <reply/kirim PDF>", "example": ".compresspdf", "cooldown": 15, "energi": 1}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-compresspdf": "compresspdf", "umi-compresspdf": "compresspdf", "umi-komprespdf": "komprespdf", "umi-pdfcompress": "pdfcompress", "compresspdf": "compresspdf", "komprespdf": "komprespdf", "pdfcompress": "pdfcompress"}
export default handler
