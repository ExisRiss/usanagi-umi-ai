import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "igqc", "category": "maker", "aliasMap": {"umi-maker-igqc": "igqc", "umi-igqc": "igqc", "umi-igquote": "igquote", "umi-qcinstagram": "qcinstagram", "igqc": "igqc", "igquote": "igquote", "qcinstagram": "qcinstagram"}, "description": "Membuat gambar Instagram Quote Chat / IGQC", "usage": ".igqc <teks> (opsional reply/kirim foto)", "example": ".igqc Ini tuh namanya pap dari my mbg yh 🌹🌹", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/igqc.js", metadata, m, extra)
handler.help = ["umi-maker-igqc <teks> (opsional reply/kirim foto)"]
handler.command = ["umi-maker-igqc", "umi-igqc", "umi-igquote", "umi-qcinstagram", "igqc", "igquote", "qcinstagram"]
handler.tags = ["maker"]
handler.description = "Membuat gambar Instagram Quote Chat / IGQC"
handler.importSource = "umi"
handler.importConfig = {"name": "igqc", "alias": ["igquote", "qcinstagram"], "category": "maker", "description": "Membuat gambar Instagram Quote Chat / IGQC", "usage": ".igqc <teks> (opsional reply/kirim foto)", "example": ".igqc Ini tuh namanya pap dari my mbg yh 🌹🌹", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-igqc": "igqc", "umi-igqc": "igqc", "umi-igquote": "igquote", "umi-qcinstagram": "qcinstagram", "igqc": "igqc", "igquote": "igquote", "qcinstagram": "qcinstagram"}
export default handler
