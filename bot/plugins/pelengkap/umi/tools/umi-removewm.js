import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "removewm", "category": "tools", "aliasMap": {"umi-tools-removewm": "removewm", "umi-removewm": "removewm", "umi-ezremove": "ezremove", "umi-nobgwm": "nobgwm", "umi-delwm": "delwm", "umi-unwatermark": "unwatermark", "removewm": "removewm", "ezremove": "ezremove", "nobgwm": "nobgwm", "delwm": "delwm", "unwatermark": "unwatermark"}, "description": "Menghapus watermark dari gambar (foto biasa maupun dokumen)", "usage": ".removewm (kirim/reply gambar)", "example": ".removewm (reply gambar berwatermark)", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/removewm.js", metadata, m, extra)
handler.help = ["umi-tools-removewm (kirim/reply gambar)"]
handler.command = ["umi-tools-removewm", "umi-removewm", "umi-ezremove", "umi-nobgwm", "umi-delwm", "umi-unwatermark", "removewm", "ezremove", "nobgwm", "delwm", "unwatermark"]
handler.tags = ["tools"]
handler.description = "Menghapus watermark dari gambar (foto biasa maupun dokumen)"
handler.importSource = "umi"
handler.importConfig = {"name": "removewm", "alias": ["ezremove", "nobgwm", "delwm", "unwatermark"], "category": "tools", "description": "Menghapus watermark dari gambar (foto biasa maupun dokumen)", "usage": ".removewm (kirim/reply gambar)", "example": ".removewm (reply gambar berwatermark)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-removewm": "removewm", "umi-removewm": "removewm", "umi-ezremove": "ezremove", "umi-nobgwm": "nobgwm", "umi-delwm": "delwm", "umi-unwatermark": "unwatermark", "removewm": "removewm", "ezremove": "ezremove", "nobgwm": "nobgwm", "delwm": "delwm", "unwatermark": "unwatermark"}
export default handler
