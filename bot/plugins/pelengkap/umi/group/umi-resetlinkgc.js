/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetlinkgc", "category": "group", "aliasMap": {"umi-group-resetlinkgc": "resetlinkgc", "umi-resetlinkgc": "resetlinkgc", "umi-resetlink": "resetlink", "umi-revokelink": "revokelink", "umi-newlink": "newlink", "resetlinkgc": "resetlinkgc", "resetlink": "resetlink", "revokelink": "revokelink", "newlink": "newlink"}, "description": "Reset link invite grup", "usage": ".resetlinkgc", "example": ".resetlinkgc", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/resetlinkgc.js", metadata, m, extra)
handler.help = ["umi-group-resetlinkgc"]
handler.command = ["umi-group-resetlinkgc", "umi-resetlinkgc", "umi-resetlink", "umi-revokelink", "umi-newlink", "resetlinkgc", "resetlink", "revokelink", "newlink"]
handler.tags = ["group"]
handler.description = "Reset link invite grup"
handler.importSource = "umi"
handler.importConfig = {"name": "resetlinkgc", "alias": ["resetlink", "revokelink", "newlink"], "category": "group", "description": "Reset link invite grup", "usage": ".resetlinkgc", "example": ".resetlinkgc", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-resetlinkgc": "resetlinkgc", "umi-resetlinkgc": "resetlinkgc", "umi-resetlink": "resetlink", "umi-revokelink": "revokelink", "umi-newlink": "newlink", "resetlinkgc": "resetlinkgc", "resetlink": "resetlink", "revokelink": "revokelink", "newlink": "newlink"}
export default handler
