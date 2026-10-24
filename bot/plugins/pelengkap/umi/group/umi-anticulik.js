import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anticulik", "category": "group", "aliasMap": {"umi-group-anticulik": "anticulik", "umi-anticulik": "anticulik", "umi-antikidnap": "antikidnap", "umi-antiileng": "antiileng", "umi-anticulikgc": "anticulikgc", "anticulik": "anticulik", "antikidnap": "antikidnap", "antiileng": "antiileng", "anticulikgc": "anticulikgc"}, "description": "Bot otomatis keluar grup jika ditambah tanpa izin", "usage": ".anticulik on/off", "example": ".anticulik on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/anticulik.js", metadata, m, extra)
handler.help = ["umi-group-anticulik on/off"]
handler.command = ["umi-group-anticulik", "umi-anticulik", "umi-antikidnap", "umi-antiileng", "umi-anticulikgc", "anticulik", "antikidnap", "antiileng", "anticulikgc"]
handler.tags = ["group"]
handler.description = "Bot otomatis keluar grup jika ditambah tanpa izin"
handler.importSource = "umi"
handler.importConfig = {"name": "anticulik", "alias": ["antikidnap", "antiileng", "anticulikgc"], "category": "group", "description": "Bot otomatis keluar grup jika ditambah tanpa izin", "usage": ".anticulik on/off", "example": ".anticulik on", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-anticulik": "anticulik", "umi-anticulik": "anticulik", "umi-antikidnap": "antikidnap", "umi-antiileng": "antiileng", "umi-anticulikgc": "anticulikgc", "anticulik": "anticulik", "antikidnap": "antikidnap", "antiileng": "antiileng", "anticulikgc": "anticulikgc"}
export default handler
