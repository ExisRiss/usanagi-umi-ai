/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakestory3", "category": "canvas", "aliasMap": {"umi-canvas-fakestory3": "fakestory3", "umi-fakestory3": "fakestory3", "umi-fstory3": "fstory3", "umi-igstory3": "igstory3", "umi-quotestory": "quotestory", "fakestory3": "fakestory3", "fstory3": "fstory3", "igstory3": "igstory3", "quotestory": "quotestory"}, "description": "Fake Instagram story dengan text overlay", "usage": ".fakestory3 <nama>|<text1>|<text2>", "example": ".fakestory3 Misaki|Tersenyumlah|untuk menutupi kesedihan", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakestory3.js", metadata, m, extra)
handler.help = ["umi-canvas-fakestory3 <nama>|<text1>|<text2>"]
handler.command = ["umi-canvas-fakestory3", "umi-fakestory3", "umi-fstory3", "umi-igstory3", "umi-quotestory", "fakestory3", "fstory3", "igstory3", "quotestory"]
handler.tags = ["canvas"]
handler.description = "Fake Instagram story dengan text overlay"
handler.importSource = "umi"
handler.importConfig = {"name": "fakestory3", "alias": ["fstory3", "igstory3", "quotestory"], "category": "canvas", "description": "Fake Instagram story dengan text overlay", "usage": ".fakestory3 <nama>|<text1>|<text2>", "example": ".fakestory3 Misaki|Tersenyumlah|untuk menutupi kesedihan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakestory3": "fakestory3", "umi-fakestory3": "fakestory3", "umi-fstory3": "fstory3", "umi-igstory3": "igstory3", "umi-quotestory": "quotestory", "fakestory3": "fakestory3", "fstory3": "fstory3", "igstory3": "igstory3", "quotestory": "quotestory"}
export default handler
