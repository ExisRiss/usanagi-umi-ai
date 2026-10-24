/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "onlygc", "category": "owner", "aliasMap": {"umi-owner-onlygc": "onlygc", "umi-onlygc": "onlygc", "umi-onlygroup": "onlygroup", "umi-grouponly": "grouponly", "onlygroup": "onlygroup", "grouponly": "grouponly"}, "description": "Toggle mode bot hanya di grup", "usage": ".onlygc on/off", "example": ".onlygc on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/onlygc.js", metadata, m, extra)
handler.help = ["umi-owner-onlygc on/off"]
handler.command = ["umi-owner-onlygc", "umi-onlygc", "umi-onlygroup", "umi-grouponly", "onlygroup", "grouponly"]
handler.tags = ["owner"]
handler.description = "Toggle mode bot hanya di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "onlygc", "alias": ["onlygroup", "grouponly"], "category": "owner", "description": "Toggle mode bot hanya di grup", "usage": ".onlygc on/off", "example": ".onlygc on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-onlygc": "onlygc", "umi-onlygc": "onlygc", "umi-onlygroup": "onlygroup", "umi-grouponly": "grouponly", "onlygroup": "onlygroup", "grouponly": "grouponly"}
export default handler
