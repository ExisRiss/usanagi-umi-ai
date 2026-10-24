import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekpacar", "category": "fun", "aliasMap": {"umi-fun-cekpacar": "cekpacar", "umi-cekpacar": "cekpacar", "umi-pacar": "pacar", "umi-pasangan": "pasangan", "umi-gebetan": "gebetan", "pasangan": "pasangan", "gebetan": "gebetan"}, "description": "Cek status hubungan seseorang", "usage": ".cekpacar atau .cekpacar @tag", "example": ".cekpacar", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/cekpacar.js", metadata, m, extra)
handler.help = ["umi-fun-cekpacar atau .cekpacar @tag"]
handler.command = ["umi-fun-cekpacar", "umi-cekpacar", "umi-pacar", "umi-pasangan", "umi-gebetan", "pasangan", "gebetan"]
handler.tags = ["fun"]
handler.description = "Cek status hubungan seseorang"
handler.importSource = "umi"
handler.importConfig = {"name": "cekpacar", "alias": ["pacar", "pasangan", "gebetan"], "category": "fun", "description": "Cek status hubungan seseorang", "usage": ".cekpacar atau .cekpacar @tag", "example": ".cekpacar", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-cekpacar": "cekpacar", "umi-cekpacar": "cekpacar", "umi-pacar": "pacar", "umi-pasangan": "pasangan", "umi-gebetan": "gebetan", "pasangan": "pasangan", "gebetan": "gebetan"}
export default handler
