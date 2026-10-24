import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addantilink", "category": "group", "aliasMap": {"umi-group-addantilink": "addantilink", "umi-addantilink": "addantilink", "umi-addalink": "addalink", "umi-addblocklink": "addblocklink", "addantilink": "addantilink", "addalink": "addalink", "addblocklink": "addblocklink"}, "description": "Menambah link ke daftar antilink", "usage": ".addantilink <domain/pattern>", "example": ".addantilink tiktok.com", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/addantilink.js", metadata, m, extra)
handler.help = ["umi-group-addantilink <domain/pattern>"]
handler.command = ["umi-group-addantilink", "umi-addantilink", "umi-addalink", "umi-addblocklink", "addantilink", "addalink", "addblocklink"]
handler.tags = ["group"]
handler.description = "Menambah link ke daftar antilink"
handler.importSource = "umi"
handler.importConfig = {"name": "addantilink", "alias": ["addalink", "addblocklink"], "category": "group", "description": "Menambah link ke daftar antilink", "usage": ".addantilink <domain/pattern>", "example": ".addantilink tiktok.com", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-addantilink": "addantilink", "umi-addantilink": "addantilink", "umi-addalink": "addalink", "umi-addblocklink": "addblocklink", "addantilink": "addantilink", "addalink": "addalink", "addblocklink": "addblocklink"}
export default handler
