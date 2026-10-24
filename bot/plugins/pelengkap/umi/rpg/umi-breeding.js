import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "breeding", "category": "rpg", "aliasMap": {"umi-rpg-breeding": "breeding", "umi-breeding": "breeding", "umi-breed": "breed", "umi-kawin": "kawin", "umi-petbreed": "petbreed"}, "description": "Breeding pets untuk mendapat pet baru", "usage": ".breeding @user", "example": ".breeding @user", "cooldown": 3600, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/breeding.js", metadata, m, extra)
handler.help = ["umi-rpg-breeding @user"]
handler.command = ["umi-rpg-breeding", "umi-breeding", "umi-breed", "umi-kawin", "umi-petbreed"]
handler.tags = ["rpg"]
handler.description = "Breeding pets untuk mendapat pet baru"
handler.importSource = "umi"
handler.importConfig = {"name": "breeding", "alias": ["breed", "kawin", "petbreed"], "category": "rpg", "description": "Breeding pets untuk mendapat pet baru", "usage": ".breeding @user", "example": ".breeding @user", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3600, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-breeding": "breeding", "umi-breeding": "breeding", "umi-breed": "breed", "umi-kawin": "kawin", "umi-petbreed": "petbreed"}
export default handler
