import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clandemote", "category": "clan", "aliasMap": {"umi-clan-clandemote": "clandemote", "umi-clandemote": "clandemote", "umi-demoteclan": "demoteclan", "umi-removerole": "removerole", "clandemote": "clandemote", "demoteclan": "demoteclan", "removerole": "removerole"}, "description": "Turunkan jabatan member", "usage": ".clandemote @user", "example": ".clandemote @user", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clandemote.js", metadata, m, extra)
handler.help = ["umi-clan-clandemote @user"]
handler.command = ["umi-clan-clandemote", "umi-clandemote", "umi-demoteclan", "umi-removerole", "clandemote", "demoteclan", "removerole"]
handler.tags = ["clan"]
handler.description = "Turunkan jabatan member"
handler.importSource = "umi"
handler.importConfig = {"name": "clandemote", "alias": ["demoteclan", "removerole"], "category": "clan", "description": "Turunkan jabatan member", "usage": ".clandemote @user", "example": ".clandemote @user", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clandemote": "clandemote", "umi-clandemote": "clandemote", "umi-demoteclan": "demoteclan", "umi-removerole": "removerole", "clandemote": "clandemote", "demoteclan": "demoteclan", "removerole": "removerole"}
export default handler
