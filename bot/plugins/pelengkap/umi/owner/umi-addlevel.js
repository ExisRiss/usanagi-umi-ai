/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addlevel", "category": "owner", "aliasMap": {"umi-owner-addlevel": "addlevel", "umi-addlevel": "addlevel", "umi-tambahlevel": "tambahlevel", "umi-givelevel": "givelevel", "umi-addlvl": "addlvl", "addlevel": "addlevel", "tambahlevel": "tambahlevel", "givelevel": "givelevel", "addlvl": "addlvl"}, "description": "Tambah level user (via exp)", "usage": ".addlevel <jumlah> @user", "example": ".addlevel 5 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addlevel.js", metadata, m, extra)
handler.help = ["umi-owner-addlevel <jumlah> @user"]
handler.command = ["umi-owner-addlevel", "umi-addlevel", "umi-tambahlevel", "umi-givelevel", "umi-addlvl", "addlevel", "tambahlevel", "givelevel", "addlvl"]
handler.tags = ["owner"]
handler.description = "Tambah level user (via exp)"
handler.importSource = "umi"
handler.importConfig = {"name": "addlevel", "alias": ["tambahlevel", "givelevel", "addlvl"], "category": "owner", "description": "Tambah level user (via exp)", "usage": ".addlevel <jumlah> @user", "example": ".addlevel 5 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addlevel": "addlevel", "umi-addlevel": "addlevel", "umi-tambahlevel": "tambahlevel", "umi-givelevel": "givelevel", "umi-addlvl": "addlvl", "addlevel": "addlevel", "tambahlevel": "tambahlevel", "givelevel": "givelevel", "addlvl": "addlvl"}
export default handler
