/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antivirtex", "category": "group", "aliasMap": {"umi-group-antivirtex": "antivirtex", "umi-antivirtex": "antivirtex", "umi-antivirtexgc": "antivirtexgc", "umi-antivtxt": "antivtxt", "umi-antitxtv": "antitxtv", "antivirtexgc": "antivirtexgc", "antivtxt": "antivtxt", "antitxtv": "antitxtv"}, "description": "Hapus otomatis pesan yang mengandung karakter aneh/virtex di grup", "usage": ".antivirtex on/off", "example": ".antivirtex on", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antivirtex.js", metadata, m, extra)
handler.help = ["umi-group-antivirtex on/off"]
handler.command = ["umi-group-antivirtex", "umi-antivirtex", "umi-antivirtexgc", "umi-antivtxt", "umi-antitxtv", "antivirtexgc", "antivtxt", "antitxtv"]
handler.tags = ["group"]
handler.description = "Hapus otomatis pesan yang mengandung karakter aneh/virtex di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antivirtex", "alias": ["antivirtexgc", "antivtxt", "antitxtv"], "category": "group", "description": "Hapus otomatis pesan yang mengandung karakter aneh/virtex di grup", "usage": ".antivirtex on/off", "example": ".antivirtex on", "isAdmin": true, "isGroup": true, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antivirtex": "antivirtex", "umi-antivirtex": "antivirtex", "umi-antivirtexgc": "antivirtexgc", "umi-antivtxt": "antivtxt", "umi-antitxtv": "antitxtv", "antivirtexgc": "antivirtexgc", "antivtxt": "antivtxt", "antitxtv": "antitxtv"}
export default handler
