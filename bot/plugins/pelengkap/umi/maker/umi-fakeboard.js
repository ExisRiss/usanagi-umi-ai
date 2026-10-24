import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeboard", "category": "maker", "aliasMap": {"umi-maker-fakeboard": "fakeboard", "umi-fakeboard": "fakeboard", "umi-boardquote": "boardquote", "umi-quoteboard": "quoteboard", "umi-papanquote": "papanquote", "fakeboard": "fakeboard", "boardquote": "boardquote", "quoteboard": "quoteboard", "papanquote": "papanquote"}, "description": "Membuat gambar papan quote/kutipan dengan author custom", "usage": ".fakeboard <teks>|<author>", "example": ".fakeboard Tetap semangat walau codingan error|Alwayscodex", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakeboard.js", metadata, m, extra)
handler.help = ["umi-maker-fakeboard <teks>|<author>"]
handler.command = ["umi-maker-fakeboard", "umi-fakeboard", "umi-boardquote", "umi-quoteboard", "umi-papanquote", "fakeboard", "boardquote", "quoteboard", "papanquote"]
handler.tags = ["maker"]
handler.description = "Membuat gambar papan quote/kutipan dengan author custom"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeboard", "alias": ["boardquote", "quoteboard", "papanquote"], "category": "maker", "description": "Membuat gambar papan quote/kutipan dengan author custom", "usage": ".fakeboard <teks>|<author>", "example": ".fakeboard Tetap semangat walau codingan error|Alwayscodex", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakeboard": "fakeboard", "umi-fakeboard": "fakeboard", "umi-boardquote": "boardquote", "umi-quoteboard": "quoteboard", "umi-papanquote": "papanquote", "fakeboard": "fakeboard", "boardquote": "boardquote", "quoteboard": "quoteboard", "papanquote": "papanquote"}
export default handler
