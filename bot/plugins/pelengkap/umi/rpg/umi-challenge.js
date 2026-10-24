import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "challenge", "category": "rpg", "aliasMap": {"umi-rpg-challenge": "challenge", "umi-challenge": "challenge", "umi-dailychallenge": "dailychallenge", "umi-tantangan": "tantangan"}, "description": "Daily challenge untuk hadiah spesial", "usage": ".challenge", "example": ".challenge", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/challenge.js", metadata, m, extra)
handler.help = ["umi-rpg-challenge"]
handler.command = ["umi-rpg-challenge", "umi-challenge", "umi-dailychallenge", "umi-tantangan"]
handler.tags = ["rpg"]
handler.description = "Daily challenge untuk hadiah spesial"
handler.importSource = "umi"
handler.importConfig = {"name": "challenge", "alias": ["daily", "dailychallenge", "tantangan"], "category": "rpg", "description": "Daily challenge untuk hadiah spesial", "usage": ".challenge", "example": ".challenge", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-challenge": "challenge", "umi-challenge": "challenge", "umi-dailychallenge": "dailychallenge", "umi-tantangan": "tantangan"}
export default handler
