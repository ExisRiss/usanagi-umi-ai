import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "linesticker", "category": "sticker", "aliasMap": {"umi-sticker-linesticker": "linesticker", "umi-linesticker": "linesticker", "umi-linepack": "linepack", "umi-line": "line", "linesticker": "linesticker", "linepack": "linepack", "line": "line"}, "description": "Download sticker pack LINE", "usage": ".linesticker <url>", "example": ".linesticker https://store.line.me/stickershop/product/9801/en", "cooldown": 25, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/linesticker.js", metadata, m, extra)
handler.help = ["umi-sticker-linesticker <url>"]
handler.command = ["umi-sticker-linesticker", "umi-linesticker", "umi-linepack", "umi-line", "linesticker", "linepack", "line"]
handler.tags = ["sticker"]
handler.description = "Download sticker pack LINE"
handler.importSource = "umi"
handler.importConfig = {"name": "linesticker", "alias": ["linepack", "line"], "category": "sticker", "description": "Download sticker pack LINE", "usage": ".linesticker <url>", "example": ".linesticker https://store.line.me/stickershop/product/9801/en", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 25, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-linesticker": "linesticker", "umi-linesticker": "linesticker", "umi-linepack": "linepack", "umi-line": "line", "linesticker": "linesticker", "linepack": "linepack", "line": "line"}
export default handler
