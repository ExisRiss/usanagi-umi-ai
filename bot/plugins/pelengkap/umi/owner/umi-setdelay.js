/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setdelay", "category": "owner", "aliasMap": {"umi-owner-setdelay": "setdelay", "umi-setdelay": "setdelay", "umi-delay": "delay", "umi-setdelaybot": "setdelaybot", "umi-botdelay": "botdelay", "setdelay": "setdelay", "delay": "delay", "setdelaybot": "setdelaybot", "botdelay": "botdelay"}, "description": "Mengatur delay respon bot (cooldown global)", "usage": ".setdelay <detik>", "example": ".setdelay 3", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setdelay.js", metadata, m, extra)
handler.help = ["umi-owner-setdelay <detik>"]
handler.command = ["umi-owner-setdelay", "umi-setdelay", "umi-delay", "umi-setdelaybot", "umi-botdelay", "setdelay", "delay", "setdelaybot", "botdelay"]
handler.tags = ["owner"]
handler.description = "Mengatur delay respon bot (cooldown global)"
handler.importSource = "umi"
handler.importConfig = {"name": "setdelay", "alias": ["delay", "setdelaybot", "botdelay"], "category": "owner", "description": "Mengatur delay respon bot (cooldown global)", "usage": ".setdelay <detik>", "example": ".setdelay 3", "isOwner": true, "cooldown": 5, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setdelay": "setdelay", "umi-setdelay": "setdelay", "umi-delay": "delay", "umi-setdelaybot": "setdelaybot", "umi-botdelay": "botdelay", "setdelay": "setdelay", "delay": "delay", "setdelaybot": "setdelaybot", "botdelay": "botdelay"}
export default handler
