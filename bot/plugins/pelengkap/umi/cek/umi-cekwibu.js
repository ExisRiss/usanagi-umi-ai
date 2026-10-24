import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekwibu", "category": "cek", "aliasMap": {"umi-cek-cekwibu": "cekwibu", "umi-cekwibu": "cekwibu", "umi-wibu": "wibu", "umi-weeb": "weeb", "weeb": "weeb"}, "description": "Cek seberapa wibu kamu", "usage": ".cekwibu <nama>", "example": ".cekwibu Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekwibu.js", metadata, m, extra)
handler.help = ["umi-cek-cekwibu <nama>"]
handler.command = ["umi-cek-cekwibu", "umi-cekwibu", "umi-wibu", "umi-weeb", "weeb"]
handler.tags = ["cek"]
handler.description = "Cek seberapa wibu kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekwibu", "alias": ["wibu", "weeb"], "category": "cek", "description": "Cek seberapa wibu kamu", "usage": ".cekwibu <nama>", "example": ".cekwibu Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekwibu": "cekwibu", "umi-cekwibu": "cekwibu", "umi-wibu": "wibu", "umi-weeb": "weeb", "weeb": "weeb"}
export default handler
