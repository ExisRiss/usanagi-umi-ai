/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pintereststalk", "category": "stalker", "aliasMap": {"umi-stalker-pintereststalk": "pintereststalk", "umi-pintereststalk": "pintereststalk", "umi-pinterestid": "pinterestid", "umi-stalkpinterest": "stalkpinterest", "umi-stalkpin": "stalkpin", "pintereststalk": "pintereststalk", "pinterestid": "pinterestid", "stalkpinterest": "stalkpinterest", "stalkpin": "stalkpin"}, "description": "Melihat informasi lengkap akun Pinterest berdasarkan username.", "usage": ".pintereststalk <username>", "example": ".pintereststalk dims", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/pintereststalk.js", metadata, m, extra)
handler.help = ["umi-stalker-pintereststalk <username>"]
handler.command = ["umi-stalker-pintereststalk", "umi-pintereststalk", "umi-pinterestid", "umi-stalkpinterest", "umi-stalkpin", "pintereststalk", "pinterestid", "stalkpinterest", "stalkpin"]
handler.tags = ["stalker"]
handler.description = "Melihat informasi lengkap akun Pinterest berdasarkan username."
handler.importSource = "umi"
handler.importConfig = {"name": "pintereststalk", "alias": ["pinterestid", "stalkpinterest", "stalkpin"], "category": "stalker", "description": "Melihat informasi lengkap akun Pinterest berdasarkan username.", "usage": ".pintereststalk <username>", "example": ".pintereststalk dims", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-pintereststalk": "pintereststalk", "umi-pintereststalk": "pintereststalk", "umi-pinterestid": "pinterestid", "umi-stalkpinterest": "stalkpinterest", "umi-stalkpin": "stalkpin", "pintereststalk": "pintereststalk", "pinterestid": "pinterestid", "stalkpinterest": "stalkpinterest", "stalkpin": "stalkpin"}
export default handler
