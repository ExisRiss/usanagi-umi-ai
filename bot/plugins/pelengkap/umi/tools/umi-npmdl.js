import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "npmdl", "category": "tools", "aliasMap": {"umi-tools-npmdl": "npmdl", "umi-npmdl": "npmdl", "umi-npmdownload": "npmdownload", "npmdl": "npmdl", "npmdownload": "npmdownload"}, "description": "Download package NPM dalam format tarball .tgz", "usage": ".npmdl <package atau URL NPM>", "example": ".npmdl axios", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/npmdl.js", metadata, m, extra)
handler.help = ["umi-tools-npmdl <package atau URL NPM>"]
handler.command = ["umi-tools-npmdl", "umi-npmdl", "umi-npmdownload", "npmdl", "npmdownload"]
handler.tags = ["tools"]
handler.description = "Download package NPM dalam format tarball .tgz"
handler.importSource = "umi"
handler.importConfig = {"name": "npmdl", "alias": ["npmdownload"], "category": "tools", "description": "Download package NPM dalam format tarball .tgz", "usage": ".npmdl <package atau URL NPM>", "example": ".npmdl axios", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-npmdl": "npmdl", "umi-npmdl": "npmdl", "umi-npmdownload": "npmdownload", "npmdl": "npmdl", "npmdownload": "npmdownload"}
export default handler
