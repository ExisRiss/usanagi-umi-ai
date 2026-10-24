import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "movieposter", "category": "canvas", "aliasMap": {"umi-canvas-movieposter": "movieposter", "umi-movieposter": "movieposter", "umi-posterfilm": "posterfilm", "umi-movieposterelaina": "movieposterelaina", "movieposter": "movieposter", "posterfilm": "posterfilm", "movieposterelaina": "movieposterelaina"}, "description": "Buat poster film bergaya sinematik dari nama, genre, dan judul", "usage": ".movieposter nama|genre|judul|tagline", "example": ".movieposter Anita Putri Azzahra|scifi|Umi: The Movie|The last slime standing", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/movieposter.js", metadata, m, extra)
handler.help = ["umi-canvas-movieposter nama|genre|judul|tagline"]
handler.command = ["umi-canvas-movieposter", "umi-movieposter", "umi-posterfilm", "umi-movieposterelaina", "movieposter", "posterfilm", "movieposterelaina"]
handler.tags = ["canvas"]
handler.description = "Buat poster film bergaya sinematik dari nama, genre, dan judul"
handler.importSource = "umi"
handler.importConfig = {"name": "movieposter", "alias": ["posterfilm", "movieposterelaina"], "category": "canvas", "description": "Buat poster film bergaya sinematik dari nama, genre, dan judul", "usage": ".movieposter nama|genre|judul|tagline", "example": ".movieposter Anita Putri Azzahra|scifi|Umi: The Movie|The last slime standing", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-movieposter": "movieposter", "umi-movieposter": "movieposter", "umi-posterfilm": "posterfilm", "umi-movieposterelaina": "movieposterelaina", "movieposter": "movieposter", "posterfilm": "posterfilm", "movieposterelaina": "movieposterelaina"}
export default handler
