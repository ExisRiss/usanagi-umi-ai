import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "logo-metal", "category": "maker", "aliasMap": {"umi-maker-logo-metal": "logo-metal", "umi-logo-metal": "logo-metal", "umi-logometal": "logometal", "umi-metallogo": "metallogo", "umi-steellogo": "steellogo", "umi-metaltext": "metaltext", "logo-metal": "logo-metal", "logometal": "logometal", "metallogo": "metallogo", "steellogo": "steellogo", "metaltext": "metaltext"}, "description": "Buat logo dengan efek logam/steel", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/logometal.js", metadata, m, extra)
handler.help = ["umi-maker-logo-metal"]
handler.command = ["umi-maker-logo-metal", "umi-logo-metal", "umi-logometal", "umi-metallogo", "umi-steellogo", "umi-metaltext", "logo-metal", "logometal", "metallogo", "steellogo", "metaltext"]
handler.tags = ["maker"]
handler.description = "Buat logo dengan efek logam/steel"
handler.importSource = "umi"
handler.importConfig = {"name": "logo-metal", "alias": ["logometal", "metallogo", "steellogo", "metaltext"], "category": "maker", "description": "Buat logo dengan efek logam/steel", "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-logo-metal": "logo-metal", "umi-logo-metal": "logo-metal", "umi-logometal": "logometal", "umi-metallogo": "metallogo", "umi-steellogo": "steellogo", "umi-metaltext": "metaltext", "logo-metal": "logo-metal", "logometal": "logometal", "metallogo": "metallogo", "steellogo": "steellogo", "metaltext": "metaltext"}
export default handler
