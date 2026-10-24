/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanupgrade", "category": "clan", "aliasMap": {"umi-clan-clanupgrade": "clanupgrade", "umi-clanupgrade": "clanupgrade", "umi-upgradeclan": "upgradeclan", "umi-levelupclan": "levelupclan", "clanupgrade": "clanupgrade", "upgradeclan": "upgradeclan", "levelupclan": "levelupclan"}, "description": "Upgrade level clan menggunakan kas clan", "usage": ".clanupgrade", "example": ".clanupgrade", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanupgrade.js", metadata, m, extra)
handler.help = ["umi-clan-clanupgrade"]
handler.command = ["umi-clan-clanupgrade", "umi-clanupgrade", "umi-upgradeclan", "umi-levelupclan", "clanupgrade", "upgradeclan", "levelupclan"]
handler.tags = ["clan"]
handler.description = "Upgrade level clan menggunakan kas clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanupgrade", "alias": ["upgradeclan", "levelupclan"], "category": "clan", "description": "Upgrade level clan menggunakan kas clan", "usage": ".clanupgrade", "example": ".clanupgrade", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanupgrade": "clanupgrade", "umi-clanupgrade": "clanupgrade", "umi-upgradeclan": "upgradeclan", "umi-levelupclan": "levelupclan", "clanupgrade": "clanupgrade", "upgradeclan": "upgradeclan", "levelupclan": "levelupclan"}
export default handler
