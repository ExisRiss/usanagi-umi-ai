/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "biner", "category": "tools", "aliasMap": {"umi-tools-biner": "biner", "umi-biner": "biner", "umi-texttobin": "texttobin", "umi-teks2bin": "teks2bin", "umi-encodebiner": "encodebiner", "biner": "biner", "texttobin": "texttobin", "teks2bin": "teks2bin", "encodebiner": "encodebiner"}, "description": "Mengubah teks menjadi kode binary", "usage": ".biner <teks>", "example": ".biner Hello", "cooldown": 2, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/binary.js", metadata, m, extra)
handler.help = ["umi-tools-biner <teks>"]
handler.command = ["umi-tools-biner", "umi-biner", "umi-texttobin", "umi-teks2bin", "umi-encodebiner", "biner", "texttobin", "teks2bin", "encodebiner"]
handler.tags = ["tools"]
handler.description = "Mengubah teks menjadi kode binary"
handler.importSource = "umi"
handler.importConfig = {"name": "biner", "alias": ["texttobin", "teks2bin", "encodebiner"], "category": "tools", "description": "Mengubah teks menjadi kode binary", "usage": ".biner <teks>", "example": ".biner Hello", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 2, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-biner": "biner", "umi-biner": "biner", "umi-texttobin": "texttobin", "umi-teks2bin": "teks2bin", "umi-encodebiner": "encodebiner", "biner": "biner", "texttobin": "texttobin", "teks2bin": "teks2bin", "encodebiner": "encodebiner"}
export default handler
