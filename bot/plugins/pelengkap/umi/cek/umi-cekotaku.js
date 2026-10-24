import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekotaku", "category": "cek", "aliasMap": {"umi-cek-cekotaku": "cekotaku", "umi-cekotaku": "cekotaku", "umi-otaku": "otaku"}, "description": "Cek tingkat otaku kamu", "usage": ".cekotaku <nama>", "example": ".cekotaku Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekotaku.js", metadata, m, extra)
handler.help = ["umi-cek-cekotaku <nama>"]
handler.command = ["umi-cek-cekotaku", "umi-cekotaku", "umi-otaku"]
handler.tags = ["cek"]
handler.description = "Cek tingkat otaku kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekotaku", "alias": ["otaku"], "category": "cek", "description": "Cek tingkat otaku kamu", "usage": ".cekotaku <nama>", "example": ".cekotaku Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekotaku": "cekotaku", "umi-cekotaku": "cekotaku", "umi-otaku": "otaku"}
export default handler
