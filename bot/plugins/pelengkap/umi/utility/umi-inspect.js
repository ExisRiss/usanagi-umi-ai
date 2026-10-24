import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "inspect", "category": "utility", "aliasMap": {"umi-utility-inspect": "inspect", "umi-cekgrup": "cekgrup", "umi-ceksaluran": "ceksaluran", "cekgrup": "cekgrup", "ceksaluran": "ceksaluran"}, "description": "Inspect info grup atau saluran WhatsApp via link", "usage": ".inspect <link grup/saluran>", "example": ".inspect https://chat.whatsapp.com/xxx", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/utility/inspect.js", metadata, m, extra)
handler.help = ["umi-utility-inspect <link grup/saluran>"]
handler.command = ["umi-utility-inspect", "umi-cekgrup", "umi-ceksaluran", "cekgrup", "ceksaluran"]
handler.tags = ["utility"]
handler.description = "Inspect info grup atau saluran WhatsApp via link"
handler.importSource = "umi"
handler.importConfig = {"name": "inspect", "alias": ["cekgrup", "ceksaluran", "groupinfo", "channelinfo"], "category": "utility", "description": "Inspect info grup atau saluran WhatsApp via link", "usage": ".inspect <link grup/saluran>", "example": ".inspect https://chat.whatsapp.com/xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-utility-inspect": "inspect", "umi-cekgrup": "cekgrup", "umi-ceksaluran": "ceksaluran", "cekgrup": "cekgrup", "ceksaluran": "ceksaluran"}
export default handler
