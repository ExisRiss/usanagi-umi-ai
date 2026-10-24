import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delantilink", "category": "group", "aliasMap": {"umi-group-delantilink": "delantilink", "umi-delantilink": "delantilink", "umi-delalink": "delalink", "umi-delblocklink": "delblocklink", "umi-remantilink": "remantilink", "delantilink": "delantilink", "delalink": "delalink", "delblocklink": "delblocklink", "remantilink": "remantilink"}, "description": "Menghapus link dari daftar antilink", "usage": ".delantilink <domain/pattern>", "example": ".delantilink tiktok.com", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/delantilink.js", metadata, m, extra)
handler.help = ["umi-group-delantilink <domain/pattern>"]
handler.command = ["umi-group-delantilink", "umi-delantilink", "umi-delalink", "umi-delblocklink", "umi-remantilink", "delantilink", "delalink", "delblocklink", "remantilink"]
handler.tags = ["group"]
handler.description = "Menghapus link dari daftar antilink"
handler.importSource = "umi"
handler.importConfig = {"name": "delantilink", "alias": ["delalink", "delblocklink", "remantilink"], "category": "group", "description": "Menghapus link dari daftar antilink", "usage": ".delantilink <domain/pattern>", "example": ".delantilink tiktok.com", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-delantilink": "delantilink", "umi-delantilink": "delantilink", "umi-delalink": "delalink", "umi-delblocklink": "delblocklink", "umi-remantilink": "remantilink", "delantilink": "delantilink", "delalink": "delalink", "delblocklink": "delblocklink", "remantilink": "remantilink"}
export default handler
