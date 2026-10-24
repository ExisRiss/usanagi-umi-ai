import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antiphising", "category": "group", "aliasMap": {"umi-group-antiphising": "antiphising", "umi-antiphising": "antiphising", "umi-antiphishing": "antiphishing", "umi-antiscamlink": "antiscamlink", "umi-nophising": "nophising", "antiphishing": "antiphishing", "antiscamlink": "antiscamlink", "nophising": "nophising"}, "description": "Deteksi konten phising di grup", "usage": ".antiphising <on/off/metode> [kick/remove]", "example": ".antiphising on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antiphising.js", metadata, m, extra)
handler.help = ["umi-group-antiphising <on/off/metode> [kick/remove]"]
handler.command = ["umi-group-antiphising", "umi-antiphising", "umi-antiphishing", "umi-antiscamlink", "umi-nophising", "antiphishing", "antiscamlink", "nophising"]
handler.tags = ["group"]
handler.description = "Deteksi konten phising di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antiphising", "alias": ["antiphishing", "antiscamlink", "nophising"], "category": "group", "description": "Deteksi konten phising di grup", "usage": ".antiphising <on/off/metode> [kick/remove]", "example": ".antiphising on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antiphising": "antiphising", "umi-antiphising": "antiphising", "umi-antiphishing": "antiphishing", "umi-antiscamlink": "antiscamlink", "umi-nophising": "nophising", "antiphishing": "antiphishing", "antiscamlink": "antiscamlink", "nophising": "nophising"}
export default handler
