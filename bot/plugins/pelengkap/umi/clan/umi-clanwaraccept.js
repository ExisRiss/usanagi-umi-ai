/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanwaraccept", "category": "clan", "aliasMap": {"umi-clan-clanwaraccept": "clanwaraccept", "umi-clanwaraccept": "clanwaraccept", "umi-acceptwar": "acceptwar", "umi-waraccept": "waraccept", "umi-terimawar": "terimawar", "clanwaraccept": "clanwaraccept", "acceptwar": "acceptwar", "waraccept": "waraccept", "terimawar": "terimawar"}, "description": "Terima tantangan clan war", "usage": ".clanwaraccept", "example": ".clanwaraccept", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanwaraccept.js", metadata, m, extra)
handler.help = ["umi-clan-clanwaraccept"]
handler.command = ["umi-clan-clanwaraccept", "umi-clanwaraccept", "umi-acceptwar", "umi-waraccept", "umi-terimawar", "clanwaraccept", "acceptwar", "waraccept", "terimawar"]
handler.tags = ["clan"]
handler.description = "Terima tantangan clan war"
handler.importSource = "umi"
handler.importConfig = {"name": "clanwaraccept", "alias": ["acceptwar", "waraccept", "terimawar"], "category": "clan", "description": "Terima tantangan clan war", "usage": ".clanwaraccept", "example": ".clanwaraccept", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanwaraccept": "clanwaraccept", "umi-clanwaraccept": "clanwaraccept", "umi-acceptwar": "acceptwar", "umi-waraccept": "waraccept", "umi-terimawar": "terimawar", "clanwaraccept": "clanwaraccept", "acceptwar": "acceptwar", "waraccept": "waraccept", "terimawar": "terimawar"}
export default handler
