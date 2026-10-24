import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "custompayment", "category": "owner", "aliasMap": {"umi-owner-custompayment": "custompayment", "umi-custompayment": "custompayment", "umi-setpayment": "setpayment", "umi-setpaytext": "setpaytext", "custompayment": "custompayment", "setpayment": "setpayment", "setpaytext": "setpaytext"}, "description": "Atur teks custom untuk .payment dengan placeholder", "usage": ".custompayment <teks> / .custompayment reset", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/custompayment.js", metadata, m, extra)
handler.help = ["umi-owner-custompayment <teks> / .custompayment reset"]
handler.command = ["umi-owner-custompayment", "umi-custompayment", "umi-setpayment", "umi-setpaytext", "custompayment", "setpayment", "setpaytext"]
handler.tags = ["owner"]
handler.description = "Atur teks custom untuk .payment dengan placeholder"
handler.importSource = "umi"
handler.importConfig = {"name": "custompayment", "alias": ["setpayment", "setpaytext"], "category": "owner", "description": "Atur teks custom untuk .payment dengan placeholder", "usage": ".custompayment <teks> / .custompayment reset", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-custompayment": "custompayment", "umi-custompayment": "custompayment", "umi-setpayment": "setpayment", "umi-setpaytext": "setpaytext", "custompayment": "custompayment", "setpayment": "setpayment", "setpaytext": "setpaytext"}
export default handler
