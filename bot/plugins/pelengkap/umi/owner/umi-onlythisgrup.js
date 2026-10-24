import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "onlythisgrup", "category": "owner", "aliasMap": {"umi-owner-onlythisgrup": "onlythisgrup", "umi-onlythisgrup": "onlythisgrup", "umi-onlythisgroup": "onlythisgroup", "umi-lockgrup": "lockgrup", "umi-lockgroup": "lockgroup", "onlythisgrup": "onlythisgrup", "onlythisgroup": "onlythisgroup", "lockgrup": "lockgrup", "lockgroup": "lockgroup"}, "description": "Bot hanya aktif di grup ini saja", "usage": ".onlythisgrup", "example": ".onlythisgrup", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/onlythisgrup.js", metadata, m, extra)
handler.help = ["umi-owner-onlythisgrup"]
handler.command = ["umi-owner-onlythisgrup", "umi-onlythisgrup", "umi-onlythisgroup", "umi-lockgrup", "umi-lockgroup", "onlythisgrup", "onlythisgroup", "lockgrup", "lockgroup"]
handler.tags = ["owner"]
handler.description = "Bot hanya aktif di grup ini saja"
handler.importSource = "umi"
handler.importConfig = {"name": "onlythisgrup", "alias": ["onlythisgroup", "lockgrup", "lockgroup"], "category": "owner", "description": "Bot hanya aktif di grup ini saja", "usage": ".onlythisgrup", "example": ".onlythisgrup", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-onlythisgrup": "onlythisgrup", "umi-onlythisgrup": "onlythisgrup", "umi-onlythisgroup": "onlythisgroup", "umi-lockgrup": "lockgrup", "umi-lockgroup": "lockgroup", "onlythisgrup": "onlythisgrup", "onlythisgroup": "onlythisgroup", "lockgrup": "lockgrup", "lockgroup": "lockgroup"}
export default handler
