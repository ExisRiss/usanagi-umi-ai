/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "linkgc", "category": "group", "aliasMap": {"umi-group-linkgc": "linkgc", "umi-linkgc": "linkgc", "umi-linkgrup": "linkgrup", "umi-getlink": "getlink", "umi-gclink": "gclink", "getlink": "getlink", "gclink": "gclink"}, "description": "Dapatkan link invite grup", "usage": ".linkgc", "example": ".linkgc", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/linkgc.js", metadata, m, extra)
handler.help = ["umi-group-linkgc"]
handler.command = ["umi-group-linkgc", "umi-linkgc", "umi-linkgrup", "umi-getlink", "umi-gclink", "getlink", "gclink"]
handler.tags = ["group"]
handler.description = "Dapatkan link invite grup"
handler.importSource = "umi"
handler.importConfig = {"name": "linkgc", "alias": ["linkgrup", "getlink", "gclink"], "category": "group", "description": "Dapatkan link invite grup", "usage": ".linkgc", "example": ".linkgc", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-linkgc": "linkgc", "umi-linkgc": "linkgc", "umi-linkgrup": "linkgrup", "umi-getlink": "getlink", "umi-gclink": "gclink", "getlink": "getlink", "gclink": "gclink"}
export default handler
