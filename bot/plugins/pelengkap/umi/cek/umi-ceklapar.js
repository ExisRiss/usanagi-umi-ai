import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceklapar", "category": "cek", "aliasMap": {"umi-cek-ceklapar": "ceklapar", "umi-ceklapar": "ceklapar", "umi-lapar": "lapar", "umi-hungry": "hungry", "hungry": "hungry"}, "description": "Cek tingkat kelaparan kamu", "usage": ".ceklapar <nama>", "example": ".ceklapar Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/ceklapar.js", metadata, m, extra)
handler.help = ["umi-cek-ceklapar <nama>"]
handler.command = ["umi-cek-ceklapar", "umi-ceklapar", "umi-lapar", "umi-hungry", "hungry"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kelaparan kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "ceklapar", "alias": ["lapar", "hungry"], "category": "cek", "description": "Cek tingkat kelaparan kamu", "usage": ".ceklapar <nama>", "example": ".ceklapar Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-ceklapar": "ceklapar", "umi-ceklapar": "ceklapar", "umi-lapar": "lapar", "umi-hungry": "hungry", "hungry": "hungry"}
export default handler
