/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "onlypc", "category": "owner", "aliasMap": {"umi-owner-onlypc": "onlypc", "umi-onlypc": "onlypc", "umi-onlyprivate": "onlyprivate", "umi-privateonly": "privateonly", "onlyprivate": "onlyprivate", "privateonly": "privateonly"}, "description": "Toggle mode bot hanya di private chat", "usage": ".onlypc on/off", "example": ".onlypc on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/onlypc.js", metadata, m, extra)
handler.help = ["umi-owner-onlypc on/off"]
handler.command = ["umi-owner-onlypc", "umi-onlypc", "umi-onlyprivate", "umi-privateonly", "onlyprivate", "privateonly"]
handler.tags = ["owner"]
handler.description = "Toggle mode bot hanya di private chat"
handler.importSource = "umi"
handler.importConfig = {"name": "onlypc", "alias": ["onlyprivate", "privateonly"], "category": "owner", "description": "Toggle mode bot hanya di private chat", "usage": ".onlypc on/off", "example": ".onlypc on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-onlypc": "onlypc", "umi-onlypc": "onlypc", "umi-onlyprivate": "onlyprivate", "umi-privateonly": "privateonly", "onlyprivate": "onlyprivate", "privateonly": "privateonly"}
export default handler
