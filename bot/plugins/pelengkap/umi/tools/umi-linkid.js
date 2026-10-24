/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "linkid", "category": "tools", "aliasMap": {"umi-tools-linkid": "linkid", "umi-linkid": "linkid", "umi-idlink": "idlink", "umi-getidlink": "getidlink", "linkid": "linkid", "idlink": "idlink", "getidlink": "getidlink"}, "description": "Ambil ID WhatsApp dari link channel atau grup", "usage": ".linkid <link channel/grup>", "example": ".linkid https://whatsapp.com/channel/0029Vb8dmsUElagkVPIw9X2P", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/linkid.js", metadata, m, extra)
handler.help = ["umi-tools-linkid <link channel/grup>"]
handler.command = ["umi-tools-linkid", "umi-linkid", "umi-idlink", "umi-getidlink", "linkid", "idlink", "getidlink"]
handler.tags = ["tools"]
handler.description = "Ambil ID WhatsApp dari link channel atau grup"
handler.importSource = "umi"
handler.importConfig = {"name": "linkid", "alias": ["idlink", "getidlink"], "category": "tools", "description": "Ambil ID WhatsApp dari link channel atau grup", "usage": ".linkid <link channel/grup>", "example": ".linkid https://whatsapp.com/channel/0029Vb8dmsUElagkVPIw9X2P", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-linkid": "linkid", "umi-linkid": "linkid", "umi-idlink": "idlink", "umi-getidlink": "getidlink", "linkid": "linkid", "idlink": "idlink", "getidlink": "getidlink"}
export default handler
