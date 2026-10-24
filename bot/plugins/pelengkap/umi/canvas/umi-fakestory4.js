import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakestory4", "category": "canvas", "aliasMap": {"umi-canvas-fakestory4": "fakestory4", "umi-fakestory4": "fakestory4", "umi-fstory4": "fstory4", "umi-igstory4": "igstory4", "umi-albumstory": "albumstory", "fakestory4": "fakestory4", "fstory4": "fstory4", "igstory4": "igstory4", "albumstory": "albumstory"}, "description": "Fake Instagram story dengan 2 gambar berbeda", "usage": ".fakestory4 <nama>", "example": ".fakestory4 Misaki (reply album/2 gambar)", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakestory4.js", metadata, m, extra)
handler.help = ["umi-canvas-fakestory4 <nama>"]
handler.command = ["umi-canvas-fakestory4", "umi-fakestory4", "umi-fstory4", "umi-igstory4", "umi-albumstory", "fakestory4", "fstory4", "igstory4", "albumstory"]
handler.tags = ["canvas"]
handler.description = "Fake Instagram story dengan 2 gambar berbeda"
handler.importSource = "umi"
handler.importConfig = {"name": "fakestory4", "alias": ["fstory4", "igstory4", "albumstory"], "category": "canvas", "description": "Fake Instagram story dengan 2 gambar berbeda", "usage": ".fakestory4 <nama>", "example": ".fakestory4 Misaki (reply album/2 gambar)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakestory4": "fakestory4", "umi-fakestory4": "fakestory4", "umi-fstory4": "fstory4", "umi-igstory4": "igstory4", "umi-albumstory": "albumstory", "fakestory4": "fakestory4", "fstory4": "fstory4", "igstory4": "igstory4", "albumstory": "albumstory"}
export default handler
