/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hitungwrmlbb", "category": "tools", "aliasMap": {"umi-tools-hitungwrmlbb": "hitungwrmlbb", "umi-hitungwrmlbb": "hitungwrmlbb", "umi-wrml": "wrml", "umi-wrmlbb": "wrmlbb", "umi-winrate": "winrate", "hitungwrmlbb": "hitungwrmlbb", "wrml": "wrml", "wrmlbb": "wrmlbb", "winrate": "winrate"}, "description": "Hitung kebutuhan win tanpa lose untuk mencapai target win rate di Mobile Legends.", "usage": ".hitungwrmlbb <total_match> <wr_sekarang> <wr_target>", "example": ".hitungwrmlbb 4242 22 88", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hitungwrmlbb.js", metadata, m, extra)
handler.help = ["umi-tools-hitungwrmlbb <total_match> <wr_sekarang> <wr_target>"]
handler.command = ["umi-tools-hitungwrmlbb", "umi-hitungwrmlbb", "umi-wrml", "umi-wrmlbb", "umi-winrate", "hitungwrmlbb", "wrml", "wrmlbb", "winrate"]
handler.tags = ["tools"]
handler.description = "Hitung kebutuhan win tanpa lose untuk mencapai target win rate di Mobile Legends."
handler.importSource = "umi"
handler.importConfig = {"name": "hitungwrmlbb", "alias": ["wrml", "wrmlbb", "winrate"], "category": "tools", "description": "Hitung kebutuhan win tanpa lose untuk mencapai target win rate di Mobile Legends.", "usage": ".hitungwrmlbb <total_match> <wr_sekarang> <wr_target>", "example": ".hitungwrmlbb 4242 22 88", "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-hitungwrmlbb": "hitungwrmlbb", "umi-hitungwrmlbb": "hitungwrmlbb", "umi-wrml": "wrml", "umi-wrmlbb": "wrmlbb", "umi-winrate": "winrate", "hitungwrmlbb": "hitungwrmlbb", "wrml": "wrml", "wrmlbb": "wrmlbb", "winrate": "winrate"}
export default handler
