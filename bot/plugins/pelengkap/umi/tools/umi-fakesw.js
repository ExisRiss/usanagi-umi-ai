/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakesw", "category": "tools", "aliasMap": {"umi-tools-fakesw": "fakesw", "umi-fakesw": "fakesw", "umi-fsw": "fsw", "umi-swfake": "swfake", "fakesw": "fakesw", "fsw": "fsw", "swfake": "swfake"}, "description": "Generate gambar Fake Status WhatsApp", "usage": ".fakesw sw|views|caption (Reply Gambar)", "example": ".fakesw My Contact|1250|Lagi santai nih (dengan reply gambar)", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/fakesw.js", metadata, m, extra)
handler.help = ["umi-tools-fakesw sw|views|caption (Reply Gambar)"]
handler.command = ["umi-tools-fakesw", "umi-fakesw", "umi-fsw", "umi-swfake", "fakesw", "fsw", "swfake"]
handler.tags = ["tools"]
handler.description = "Generate gambar Fake Status WhatsApp"
handler.importSource = "umi"
handler.importConfig = {"name": "fakesw", "alias": ["fsw", "swfake"], "category": "tools", "description": "Generate gambar Fake Status WhatsApp", "usage": ".fakesw sw|views|caption (Reply Gambar)", "example": ".fakesw My Contact|1250|Lagi santai nih (dengan reply gambar)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-fakesw": "fakesw", "umi-fakesw": "fakesw", "umi-fsw": "fsw", "umi-swfake": "swfake", "fakesw": "fakesw", "fsw": "fsw", "swfake": "swfake"}
export default handler
