import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "styleteks", "category": "tools", "aliasMap": {"umi-tools-styleteks": "styleteks", "umi-styleteks": "styleteks", "umi-fancytext": "fancytext", "umi-gaya": "gaya", "umi-tulisan": "tulisan", "umi-fontstyle": "fontstyle", "styleteks": "styleteks", "fancytext": "fancytext", "gaya": "gaya", "tulisan": "tulisan", "fontstyle": "fontstyle"}, "description": "Mengubah teks biasa menjadi berbagai gaya tulisan keren (fancy text).", "usage": ".styleteks <teks>", "example": ".styleteks Halo Dunia", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/styleteks.js", metadata, m, extra)
handler.help = ["umi-tools-styleteks <teks>"]
handler.command = ["umi-tools-styleteks", "umi-styleteks", "umi-fancytext", "umi-gaya", "umi-tulisan", "umi-fontstyle", "styleteks", "fancytext", "gaya", "tulisan", "fontstyle"]
handler.tags = ["tools"]
handler.description = "Mengubah teks biasa menjadi berbagai gaya tulisan keren (fancy text)."
handler.importSource = "umi"
handler.importConfig = {"name": "styleteks", "alias": ["fancytext", "font", "gaya", "tulisan", "fontstyle"], "category": "tools", "description": "Mengubah teks biasa menjadi berbagai gaya tulisan keren (fancy text).", "usage": ".styleteks <teks>", "example": ".styleteks Halo Dunia", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-styleteks": "styleteks", "umi-styleteks": "styleteks", "umi-fancytext": "fancytext", "umi-gaya": "gaya", "umi-tulisan": "tulisan", "umi-fontstyle": "fontstyle", "styleteks": "styleteks", "fancytext": "fancytext", "gaya": "gaya", "tulisan": "tulisan", "fontstyle": "fontstyle"}
export default handler
