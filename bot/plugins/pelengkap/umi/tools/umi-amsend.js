/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "amsend", "category": "tools", "aliasMap": {"umi-tools-amsend": "amsend", "umi-amsend": "amsend", "umi-sendam": "sendam", "umi-amremlink": "amremlink", "amsend": "amsend", "sendam": "sendam", "amremlink": "amremlink"}, "description": "Alias: kirim link AM (pakai .amprem)", "usage": ".amsend <email>  (redirect ke alur .amprem)", "example": ".amsend email@gmail.com", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/amsend.js", metadata, m, extra)
handler.help = ["umi-tools-amsend <email>  (redirect ke alur .amprem)"]
handler.command = ["umi-tools-amsend", "umi-amsend", "umi-sendam", "umi-amremlink", "amsend", "sendam", "amremlink"]
handler.tags = ["tools"]
handler.description = "Alias: kirim link AM (pakai .amprem)"
handler.importSource = "umi"
handler.importConfig = {"name": "amsend", "alias": ["sendam", "amremlink"], "category": "tools", "description": "Alias: kirim link AM (pakai .amprem)", "usage": ".amsend <email>  (redirect ke alur .amprem)", "example": ".amsend email@gmail.com", "isOwner": false, "isPremium": false, "isEnabled": true, "cooldown": 5}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-amsend": "amsend", "umi-amsend": "amsend", "umi-sendam": "sendam", "umi-amremlink": "amremlink", "amsend": "amsend", "sendam": "sendam", "amremlink": "amremlink"}
export default handler
