import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "training", "category": "rpg", "aliasMap": {"umi-rpg-training": "training", "umi-training": "training", "umi-train": "train", "umi-latihan": "latihan", "umi-workout": "workout"}, "description": "Latihan untuk meningkatkan stats", "usage": ".training <attack/defense/health>", "example": ".training attack", "cooldown": 180, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/training.js", metadata, m, extra)
handler.help = ["umi-rpg-training <attack/defense/health>"]
handler.command = ["umi-rpg-training", "umi-training", "umi-train", "umi-latihan", "umi-workout"]
handler.tags = ["rpg"]
handler.description = "Latihan untuk meningkatkan stats"
handler.importSource = "umi"
handler.importConfig = {"name": "training", "alias": ["train", "latihan", "workout"], "category": "rpg", "description": "Latihan untuk meningkatkan stats", "usage": ".training <attack/defense/health>", "example": ".training attack", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 180, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-training": "training", "umi-training": "training", "umi-train": "train", "umi-latihan": "latihan", "umi-workout": "workout"}
export default handler
