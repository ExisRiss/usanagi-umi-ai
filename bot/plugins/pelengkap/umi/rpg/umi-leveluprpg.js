import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "leveluprpg", "category": "rpg", "aliasMap": {"umi-rpg-leveluprpg": "leveluprpg", "umi-leveluprpg": "leveluprpg", "umi-lvluprpg": "lvluprpg", "umi-rpglevelup": "rpglevelup"}, "description": "Toggle notifikasi level up RPG", "usage": ".leveluprpg <on/off>", "example": ".leveluprpg on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/leveluprpg.js", metadata, m, extra)
handler.help = ["umi-rpg-leveluprpg <on/off>"]
handler.command = ["umi-rpg-leveluprpg", "umi-leveluprpg", "umi-lvluprpg", "umi-rpglevelup"]
handler.tags = ["rpg"]
handler.description = "Toggle notifikasi level up RPG"
handler.importSource = "umi"
handler.importConfig = {"name": "leveluprpg", "alias": ["lvluprpg", "rpglevelup"], "category": "rpg", "description": "Toggle notifikasi level up RPG", "usage": ".leveluprpg <on/off>", "example": ".leveluprpg on", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-leveluprpg": "leveluprpg", "umi-leveluprpg": "leveluprpg", "umi-lvluprpg": "lvluprpg", "umi-rpglevelup": "rpglevelup"}
export default handler
