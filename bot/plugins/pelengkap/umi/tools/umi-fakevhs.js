import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakevhs", "category": "tools", "aliasMap": {"umi-tools-fakevhs": "fakevhs", "umi-fakevhs": "fakevhs", "umi-vhscam": "vhscam", "umi-retrovhs": "retrovhs", "umi-handycam": "handycam", "fakevhs": "fakevhs", "vhscam": "vhscam", "retrovhs": "retrovhs", "handycam": "handycam"}, "description": "Mengubah Foto menjadi Efek Kamera Retro VHS 90-an (Ultra Real)", "usage": ".fakevhs [reply/kirim foto/dokumen foto/view once]", "example": "reply foto dengan .fakevhs"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/fakevhs.js", metadata, m, extra)
handler.help = ["umi-tools-fakevhs [reply/kirim foto/dokumen foto/view once]"]
handler.command = ["umi-tools-fakevhs", "umi-fakevhs", "umi-vhscam", "umi-retrovhs", "umi-handycam", "fakevhs", "vhscam", "retrovhs", "handycam"]
handler.tags = ["tools"]
handler.description = "Mengubah Foto menjadi Efek Kamera Retro VHS 90-an (Ultra Real)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakevhs", "alias": ["vhscam", "retrovhs", "handycam"], "category": "tools", "description": "Mengubah Foto menjadi Efek Kamera Retro VHS 90-an (Ultra Real)", "usage": ".fakevhs [reply/kirim foto/dokumen foto/view once]", "example": "reply foto dengan .fakevhs", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-fakevhs": "fakevhs", "umi-fakevhs": "fakevhs", "umi-vhscam": "vhscam", "umi-retrovhs": "retrovhs", "umi-handycam": "handycam", "fakevhs": "fakevhs", "vhscam": "vhscam", "retrovhs": "retrovhs", "handycam": "handycam"}
export default handler
