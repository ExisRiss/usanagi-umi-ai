/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanbank", "category": "clan", "aliasMap": {"umi-clan-clanbank": "clanbank", "umi-clanbank": "clanbank", "umi-kasclan": "kasclan", "umi-clanbalance": "clanbalance", "clanbank": "clanbank", "kasclan": "kasclan", "clanbalance": "clanbalance"}, "description": "Cek saldo kas clan", "usage": ".clanbank", "example": ".clanbank", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanbank.js", metadata, m, extra)
handler.help = ["umi-clan-clanbank"]
handler.command = ["umi-clan-clanbank", "umi-clanbank", "umi-kasclan", "umi-clanbalance", "clanbank", "kasclan", "clanbalance"]
handler.tags = ["clan"]
handler.description = "Cek saldo kas clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanbank", "alias": ["kasclan", "clanbalance"], "category": "clan", "description": "Cek saldo kas clan", "usage": ".clanbank", "example": ".clanbank", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanbank": "clanbank", "umi-clanbank": "clanbank", "umi-kasclan": "kasclan", "umi-clanbalance": "clanbalance", "clanbank": "clanbank", "kasclan": "kasclan", "clanbalance": "clanbalance"}
export default handler
