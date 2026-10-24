/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanrename", "category": "clan", "aliasMap": {"umi-clan-clanrename": "clanrename", "umi-clanrename": "clanrename", "umi-renameclan": "renameclan", "umi-guildrename": "guildrename", "clanrename": "clanrename", "renameclan": "renameclan", "guildrename": "guildrename"}, "description": "Ganti nama clan", "usage": ".clanrename <nama baru>", "example": ".clanrename DarkPhoenix", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanrename.js", metadata, m, extra)
handler.help = ["umi-clan-clanrename <nama baru>"]
handler.command = ["umi-clan-clanrename", "umi-clanrename", "umi-renameclan", "umi-guildrename", "clanrename", "renameclan", "guildrename"]
handler.tags = ["clan"]
handler.description = "Ganti nama clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanrename", "alias": ["renameclan", "guildrename"], "category": "clan", "description": "Ganti nama clan", "usage": ".clanrename <nama baru>", "example": ".clanrename DarkPhoenix", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanrename": "clanrename", "umi-clanrename": "clanrename", "umi-renameclan": "renameclan", "umi-guildrename": "guildrename", "clanrename": "clanrename", "renameclan": "renameclan", "guildrename": "guildrename"}
export default handler
