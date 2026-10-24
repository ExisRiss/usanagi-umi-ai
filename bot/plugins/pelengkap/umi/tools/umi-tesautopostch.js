import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tesautopostch", "category": "tools", "aliasMap": {"umi-tools-tesautopostch": "tesautopostch", "umi-tesautopostch": "tesautopostch", "umi-testch": "testch", "umi-testautopost": "testautopost", "tesautopostch": "tesautopostch", "testch": "testch", "testautopost": "testautopost"}, "description": "Test autopost ke channel sekarang", "usage": ".tesautopostch [pagi/siang/sore/malam]", "example": ".tesautopostch pagi", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/tesautopostch.js", metadata, m, extra)
handler.help = ["umi-tools-tesautopostch [pagi/siang/sore/malam]"]
handler.command = ["umi-tools-tesautopostch", "umi-tesautopostch", "umi-testch", "umi-testautopost", "tesautopostch", "testch", "testautopost"]
handler.tags = ["tools"]
handler.description = "Test autopost ke channel sekarang"
handler.importSource = "umi"
handler.importConfig = {"name": "tesautopostch", "alias": ["testch", "testautopost"], "category": "tools", "description": "Test autopost ke channel sekarang", "usage": ".tesautopostch [pagi/siang/sore/malam]", "example": ".tesautopostch pagi", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-tesautopostch": "tesautopostch", "umi-tesautopostch": "tesautopostch", "umi-testch": "testch", "umi-testautopost": "testautopost", "tesautopostch": "tesautopostch", "testch": "testch", "testautopost": "testautopost"}
export default handler
