/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakengl", "category": "canvas", "aliasMap": {"umi-canvas-fakengl": "fakengl", "umi-fakengl": "fakengl", "umi-fngl": "fngl", "umi-nglfake": "nglfake", "fakengl": "fakengl", "fngl": "fngl", "nglfake": "nglfake"}, "description": "Membuat screenshot pesan NGL palsu (have fun only)", "usage": ".fakengl <teks>", "example": ".fakengl Gw tuh sebenarnya ultramen", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakengl.js", metadata, m, extra)
handler.help = ["umi-canvas-fakengl <teks>"]
handler.command = ["umi-canvas-fakengl", "umi-fakengl", "umi-fngl", "umi-nglfake", "fakengl", "fngl", "nglfake"]
handler.tags = ["canvas"]
handler.description = "Membuat screenshot pesan NGL palsu (have fun only)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakengl", "alias": ["fngl", "nglfake"], "category": "canvas", "description": "Membuat screenshot pesan NGL palsu (have fun only)", "usage": ".fakengl <teks>", "example": ".fakengl Gw tuh sebenarnya ultramen", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-canvas-fakengl": "fakengl", "umi-fakengl": "fakengl", "umi-fngl": "fngl", "umi-nglfake": "nglfake", "fakengl": "fakengl", "fngl": "fngl", "nglfake": "nglfake"}
export default handler
