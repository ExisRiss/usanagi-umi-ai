/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "unmutegc", "category": "group", "aliasMap": {"umi-group-unmutegc": "unmutegc", "umi-unmutegc": "unmutegc", "umi-unmutegrup": "unmutegrup", "umi-unmutebot": "unmutebot", "umi-unblockbot": "unblockbot", "umi-unlockbot": "unlockbot", "unmutegc": "unmutegc", "unmutegrup": "unmutegrup", "unmutebot": "unmutebot", "unblockbot": "unblockbot", "unlockbot": "unlockbot"}, "description": "Buka blokir command bot untuk member di grup", "usage": ".unmutegc", "example": ".unmutegc", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/unmutegc.js", metadata, m, extra)
handler.help = ["umi-group-unmutegc"]
handler.command = ["umi-group-unmutegc", "umi-unmutegc", "umi-unmutegrup", "umi-unmutebot", "umi-unblockbot", "umi-unlockbot", "unmutegc", "unmutegrup", "unmutebot", "unblockbot", "unlockbot"]
handler.tags = ["group"]
handler.description = "Buka blokir command bot untuk member di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "unmutegc", "alias": ["unmutegrup", "unmutebot", "unblockbot", "unlockbot"], "category": "group", "description": "Buka blokir command bot untuk member di grup", "usage": ".unmutegc", "example": ".unmutegc", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-unmutegc": "unmutegc", "umi-unmutegc": "unmutegc", "umi-unmutegrup": "unmutegrup", "umi-unmutebot": "unmutebot", "umi-unblockbot": "unblockbot", "umi-unlockbot": "unlockbot", "unmutegc": "unmutegc", "unmutegrup": "unmutegrup", "unmutebot": "unmutebot", "unblockbot": "unblockbot", "unlockbot": "unlockbot"}
export default handler
