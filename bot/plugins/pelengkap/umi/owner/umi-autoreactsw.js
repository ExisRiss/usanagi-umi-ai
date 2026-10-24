/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autoreactsw", "category": "owner", "aliasMap": {"umi-owner-autoreactsw": "autoreactsw", "umi-autoreactsw": "autoreactsw", "umi-autoreaksi": "autoreaksi", "umi-reactsw": "reactsw", "umi-autoreactstory": "autoreactstory", "autoreactsw": "autoreactsw", "autoreaksi": "autoreaksi", "reactsw": "reactsw", "autoreactstory": "autoreactstory"}, "description": "Auto react semua status/story WA", "usage": ".autoreactsw on/off [emoji]", "example": ".autoreactsw on 🔥", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/autoreactsw.js", metadata, m, extra)
handler.help = ["umi-owner-autoreactsw on/off [emoji]"]
handler.command = ["umi-owner-autoreactsw", "umi-autoreactsw", "umi-autoreaksi", "umi-reactsw", "umi-autoreactstory", "autoreactsw", "autoreaksi", "reactsw", "autoreactstory"]
handler.tags = ["owner"]
handler.description = "Auto react semua status/story WA"
handler.importSource = "umi"
handler.importConfig = {"name": "autoreactsw", "alias": ["autoreaksi", "reactsw", "autoreactstory"], "category": "owner", "description": "Auto react semua status/story WA", "usage": ".autoreactsw on/off [emoji]", "example": ".autoreactsw on 🔥", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-autoreactsw": "autoreactsw", "umi-autoreactsw": "autoreactsw", "umi-autoreaksi": "autoreaksi", "umi-reactsw": "reactsw", "umi-autoreactstory": "autoreactstory", "autoreactsw": "autoreactsw", "autoreaksi": "autoreaksi", "reactsw": "reactsw", "autoreactstory": "autoreactstory"}
export default handler
