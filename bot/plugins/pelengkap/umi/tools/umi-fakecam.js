import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakecam", "category": "tools", "aliasMap": {"umi-tools-fakecam": "fakecam", "umi-fakecam": "fakecam", "umi-paplive": "paplive", "umi-fakekamera": "fakekamera", "umi-iphonecam": "iphonecam", "fakecam": "fakecam", "paplive": "paplive", "fakekamera": "fakekamera", "iphonecam": "iphonecam"}, "description": "Menimpa UI Kamera iOS iPhone Klasik Presisi", "usage": ".fakecam (reply/kirim foto)", "example": ".fakecam"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/fakecam.js", metadata, m, extra)
handler.help = ["umi-tools-fakecam (reply/kirim foto)"]
handler.command = ["umi-tools-fakecam", "umi-fakecam", "umi-paplive", "umi-fakekamera", "umi-iphonecam", "fakecam", "paplive", "fakekamera", "iphonecam"]
handler.tags = ["tools"]
handler.description = "Menimpa UI Kamera iOS iPhone Klasik Presisi"
handler.importSource = "umi"
handler.importConfig = {"name": "fakecam", "alias": ["paplive", "fakekamera", "iphonecam"], "category": "tools", "description": "Menimpa UI Kamera iOS iPhone Klasik Presisi", "usage": ".fakecam (reply/kirim foto)", "example": ".fakecam", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-fakecam": "fakecam", "umi-fakecam": "fakecam", "umi-paplive": "paplive", "umi-fakekamera": "fakekamera", "umi-iphonecam": "iphonecam", "fakecam": "fakecam", "paplive": "paplive", "fakekamera": "fakekamera", "iphonecam": "iphonecam"}
export default handler
