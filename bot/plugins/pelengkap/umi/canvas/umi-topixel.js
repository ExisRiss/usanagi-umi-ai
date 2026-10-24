/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "topixel", "category": "canvas", "aliasMap": {"umi-canvas-topixel": "topixel", "umi-topixel": "topixel", "umi-pixelate": "pixelate", "umi-pixelart": "pixelart", "topixel": "topixel", "pixelate": "pixelate", "pixelart": "pixelart"}, "description": "Ubah foto kamu jadi gambar pixel art yang keren", "usage": ".topixel [level] (reply/kirim foto)", "example": ".topixel 30", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/topixel.js", metadata, m, extra)
handler.help = ["umi-canvas-topixel [level] (reply/kirim foto)"]
handler.command = ["umi-canvas-topixel", "umi-topixel", "umi-pixelate", "umi-pixelart", "topixel", "pixelate", "pixelart"]
handler.tags = ["canvas"]
handler.description = "Ubah foto kamu jadi gambar pixel art yang keren"
handler.importSource = "umi"
handler.importConfig = {"name": "topixel", "alias": ["pixelate", "pixelart"], "category": "canvas", "description": "Ubah foto kamu jadi gambar pixel art yang keren", "usage": ".topixel [level] (reply/kirim foto)", "example": ".topixel 30", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-topixel": "topixel", "umi-topixel": "topixel", "umi-pixelate": "pixelate", "umi-pixelart": "pixelart", "topixel": "topixel", "pixelate": "pixelate", "pixelart": "pixelart"}
export default handler
