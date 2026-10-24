import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listantilink", "category": "group", "aliasMap": {"umi-group-listantilink": "listantilink", "umi-listantilink": "listantilink", "umi-antilinklist": "antilinklist", "umi-cekantilink": "cekantilink", "listantilink": "listantilink", "antilinklist": "antilinklist", "cekantilink": "cekantilink"}, "description": "Melihat daftar link yang diblokir", "usage": ".listantilink", "example": ".listantilink", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/listantilink.js", metadata, m, extra)
handler.help = ["umi-group-listantilink"]
handler.command = ["umi-group-listantilink", "umi-listantilink", "umi-antilinklist", "umi-cekantilink", "listantilink", "antilinklist", "cekantilink"]
handler.tags = ["group"]
handler.description = "Melihat daftar link yang diblokir"
handler.importSource = "umi"
handler.importConfig = {"name": "listantilink", "alias": ["antilinklist", "cekantilink"], "category": "group", "description": "Melihat daftar link yang diblokir", "usage": ".listantilink", "example": ".listantilink", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-listantilink": "listantilink", "umi-listantilink": "listantilink", "umi-antilinklist": "antilinklist", "umi-cekantilink": "cekantilink", "listantilink": "listantilink", "antilinklist": "antilinklist", "cekantilink": "cekantilink"}
export default handler
