import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "readmore", "category": "tools", "aliasMap": {"umi-tools-readmore": "readmore", "umi-readmore": "readmore", "umi-selengkapnya": "selengkapnya", "umi-spoiler": "spoiler"}, "description": "Membuat teks baca selengkapnya (spoiler)", "usage": ".readmore <text_awal>|<text_akhir>", "example": ".readmore Hai|Ini adalah pesan rahasia", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/readmore.js", metadata, m, extra)
handler.help = ["umi-tools-readmore <text_awal>|<text_akhir>"]
handler.command = ["umi-tools-readmore", "umi-readmore", "umi-selengkapnya", "umi-spoiler"]
handler.tags = ["tools"]
handler.description = "Membuat teks baca selengkapnya (spoiler)"
handler.importSource = "umi"
handler.importConfig = {"name": "readmore", "alias": ["selengkapnya", "spoiler"], "category": "tools", "description": "Membuat teks baca selengkapnya (spoiler)", "usage": ".readmore <text_awal>|<text_akhir>", "example": ".readmore Hai|Ini adalah pesan rahasia", "isGroup": false, "isBotAdmin": false, "isAdmin": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-readmore": "readmore", "umi-readmore": "readmore", "umi-selengkapnya": "selengkapnya", "umi-spoiler": "spoiler"}
export default handler
