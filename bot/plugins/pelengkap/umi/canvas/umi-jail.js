/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jail", "category": "maker", "aliasMap": {"umi-maker-jail": "jail", "umi-jail": "jail", "umi-penjara": "penjara", "umi-prison": "prison", "jail": "jail", "penjara": "penjara", "prison": "prison"}, "description": "Efek penjara pada foto", "usage": ".jail (reply foto)", "example": ".jail", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/jail.js", metadata, m, extra)
handler.help = ["umi-maker-jail (reply foto)"]
handler.command = ["umi-maker-jail", "umi-jail", "umi-penjara", "umi-prison", "jail", "penjara", "prison"]
handler.tags = ["maker"]
handler.description = "Efek penjara pada foto"
handler.importSource = "umi"
handler.importConfig = {"name": "jail", "alias": ["penjara", "prison"], "category": "maker", "description": "Efek penjara pada foto", "usage": ".jail (reply foto)", "example": ".jail", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-jail": "jail", "umi-jail": "jail", "umi-penjara": "penjara", "umi-prison": "prison", "jail": "jail", "penjara": "penjara", "prison": "prison"}
export default handler
