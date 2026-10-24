import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mlbb", "category": "game", "aliasMap": {"umi-game-mlbb": "mlbb", "umi-mlbb": "mlbb", "umi-mlbbcounter": "mlbbcounter", "umi-mlsynergy": "mlsynergy", "umi-mltier": "mltier", "umi-mlmatchup": "mlmatchup", "mlbb": "mlbb", "mlbbcounter": "mlbbcounter", "mlsynergy": "mlsynergy", "mltier": "mltier", "mlmatchup": "mlmatchup"}, "description": "Informasi MLBB: Rekomendasi Counter, Sinergi Hero, Prediksi Matchup, & Tier List", "usage": ".mlbb <sub-command> <args>", "example": ".mlbb counter aamon, akai, beatrix", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/mlbb.js", metadata, m, extra)
handler.help = ["umi-game-mlbb <sub-command> <args>"]
handler.command = ["umi-game-mlbb", "umi-mlbb", "umi-mlbbcounter", "umi-mlsynergy", "umi-mltier", "umi-mlmatchup", "mlbb", "mlbbcounter", "mlsynergy", "mltier", "mlmatchup"]
handler.tags = ["game"]
handler.description = "Informasi MLBB: Rekomendasi Counter, Sinergi Hero, Prediksi Matchup, & Tier List"
handler.importSource = "umi"
handler.importConfig = {"name": "mlbb", "alias": ["mlbbcounter", "mlsynergy", "mltier", "mlmatchup"], "category": "game", "description": "Informasi MLBB: Rekomendasi Counter, Sinergi Hero, Prediksi Matchup, & Tier List", "usage": ".mlbb <sub-command> <args>", "example": ".mlbb counter aamon, akai, beatrix", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-mlbb": "mlbb", "umi-mlbb": "mlbb", "umi-mlbbcounter": "mlbbcounter", "umi-mlsynergy": "mlsynergy", "umi-mltier": "mltier", "umi-mlmatchup": "mlmatchup", "mlbb": "mlbb", "mlbbcounter": "mlbbcounter", "mlsynergy": "mlsynergy", "mltier": "mltier", "mlmatchup": "mlmatchup"}
export default handler
