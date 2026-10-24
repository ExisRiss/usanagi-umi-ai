/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rednotedl", "category": "download", "aliasMap": {"umi-download-rednotedl": "rednotedl", "umi-rednotedl": "rednotedl", "umi-rednote": "rednote", "umi-xhsdl": "xhsdl", "umi-xiaohongshu": "xiaohongshu", "rednotedl": "rednotedl", "rednote": "rednote", "xhsdl": "xhsdl", "xiaohongshu": "xiaohongshu"}, "description": "Download video/foto dari RedNote (XiaoHongShu)", "usage": ".rednotedl <url>", "example": ".rednotedl https://www.xiaohongshu.com/xxx", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/rednotedl.js", metadata, m, extra)
handler.help = ["umi-download-rednotedl <url>"]
handler.command = ["umi-download-rednotedl", "umi-rednotedl", "umi-rednote", "umi-xhsdl", "umi-xiaohongshu", "rednotedl", "rednote", "xhsdl", "xiaohongshu"]
handler.tags = ["download"]
handler.description = "Download video/foto dari RedNote (XiaoHongShu)"
handler.importSource = "umi"
handler.importConfig = {"name": "rednotedl", "alias": ["rednote", "xhsdl", "xiaohongshu"], "category": "download", "description": "Download video/foto dari RedNote (XiaoHongShu)", "usage": ".rednotedl <url>", "example": ".rednotedl https://www.xiaohongshu.com/xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-rednotedl": "rednotedl", "umi-rednotedl": "rednotedl", "umi-rednote": "rednote", "umi-xhsdl": "xhsdl", "umi-xiaohongshu": "xiaohongshu", "rednotedl": "rednotedl", "rednote": "rednote", "xhsdl": "xhsdl", "xiaohongshu": "xiaohongshu"}
export default handler
