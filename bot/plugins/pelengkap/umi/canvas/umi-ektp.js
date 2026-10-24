/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ektp", "category": "canvas", "aliasMap": {"umi-canvas-ektp": "ektp", "umi-ektp": "ektp", "umi-ktp": "ktp", "ektp": "ektp", "ktp": "ktp"}, "description": "Bikin gambar e-KTP palsu", "usage": ".ektp <nik>|<nama>|<tanggalLahir> (reply/kirim foto)", "example": ".ektp 123456789|Fauzan|01-01-2000", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/ektp.js", metadata, m, extra)
handler.help = ["umi-canvas-ektp <nik>|<nama>|<tanggalLahir> (reply/kirim foto)"]
handler.command = ["umi-canvas-ektp", "umi-ektp", "umi-ktp", "ektp", "ktp"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar e-KTP palsu"
handler.importSource = "umi"
handler.importConfig = {"name": "ektp", "alias": ["ktp"], "category": "canvas", "description": "Bikin gambar e-KTP palsu", "usage": ".ektp <nik>|<nama>|<tanggalLahir> (reply/kirim foto)", "example": ".ektp 123456789|Fauzan|01-01-2000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-ektp": "ektp", "umi-ektp": "ektp", "umi-ktp": "ktp", "ektp": "ektp", "ktp": "ktp"}
export default handler
