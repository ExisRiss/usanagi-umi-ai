import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "buykoin", "category": "rpg", "aliasMap": {"umi-rpg-buykoin": "buykoin", "umi-buykoin": "buykoin", "umi-belikoin": "belikoin", "umi-belicoin": "belicoin", "umi-exptokoin": "exptokoin", "umi-exptocoin": "exptocoin", "belicoin": "belicoin", "exptocoin": "exptocoin"}, "description": "Tukar EXP menjadi Koin", "usage": ".buykoin <jumlah>", "example": ".buykoin 10000", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/buykoin.js", metadata, m, extra)
handler.help = ["umi-rpg-buykoin <jumlah>"]
handler.command = ["umi-rpg-buykoin", "umi-buykoin", "umi-belikoin", "umi-belicoin", "umi-exptokoin", "umi-exptocoin", "belicoin", "exptocoin"]
handler.tags = ["rpg"]
handler.description = "Tukar EXP menjadi Koin"
handler.importSource = "umi"
handler.importConfig = {"name": "buykoin", "alias": ["belikoin", "belicoin", "exptokoin", "exptocoin"], "category": "rpg", "description": "Tukar EXP menjadi Koin", "usage": ".buykoin <jumlah>", "example": ".buykoin 10000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-buykoin": "buykoin", "umi-buykoin": "buykoin", "umi-belikoin": "belikoin", "umi-belicoin": "belicoin", "umi-exptokoin": "exptokoin", "umi-exptocoin": "exptocoin", "belicoin": "belicoin", "exptocoin": "exptocoin"}
export default handler
