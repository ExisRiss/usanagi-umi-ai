import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "xhs", "category": "download", "aliasMap": {"umi-download-xhs": "xhs", "umi-xhs": "xhs", "xhs": "xhs"}, "description": "Downloader XHS/RedNote untuk video atau gambar.", "usage": ".xhs <url>", "example": ".xhs <url>", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/Xhs.js", metadata, m, extra)
handler.help = ["umi-download-xhs <url>"]
handler.command = ["umi-download-xhs", "umi-xhs", "xhs"]
handler.tags = ["download"]
handler.description = "Downloader XHS/RedNote untuk video atau gambar."
handler.importSource = "umi"
handler.importConfig = {"name": "xhs", "alias": [], "category": "download", "description": "Downloader XHS/RedNote untuk video atau gambar.", "usage": ".xhs <url>", "example": ".xhs <url>", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-xhs": "xhs", "umi-xhs": "xhs", "xhs": "xhs"}
export default handler
