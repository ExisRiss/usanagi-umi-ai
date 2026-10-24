import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kirimpesangc", "category": "tools", "aliasMap": {"umi-tools-kirimpesangc": "kirimpesangc", "umi-kirimpesangc": "kirimpesangc", "umi-sendgc": "sendgc", "umi-pesangc": "pesangc", "kirimpesangc": "kirimpesangc", "sendgc": "sendgc", "pesangc": "pesangc"}, "description": "Kirim pesan ke group tertentu", "usage": ".kirimpesangc pesan", "example": ".kirimpesangc ingat masa sewa kalian tinggal dikit", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/kirimpesangc.js", metadata, m, extra)
handler.help = ["umi-tools-kirimpesangc pesan"]
handler.command = ["umi-tools-kirimpesangc", "umi-kirimpesangc", "umi-sendgc", "umi-pesangc", "kirimpesangc", "sendgc", "pesangc"]
handler.tags = ["tools"]
handler.description = "Kirim pesan ke group tertentu"
handler.importSource = "umi"
handler.importConfig = {"name": "kirimpesangc", "alias": ["sendgc", "pesangc"], "category": "tools", "description": "Kirim pesan ke group tertentu", "usage": ".kirimpesangc pesan", "example": ".kirimpesangc ingat masa sewa kalian tinggal dikit", "isOwner": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-kirimpesangc": "kirimpesangc", "umi-kirimpesangc": "kirimpesangc", "umi-sendgc": "sendgc", "umi-pesangc": "pesangc", "kirimpesangc": "kirimpesangc", "sendgc": "sendgc", "pesangc": "pesangc"}
export default handler
