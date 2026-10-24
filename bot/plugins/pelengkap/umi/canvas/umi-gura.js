import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gura", "category": "canvas", "aliasMap": {"umi-canvas-gura": "gura", "umi-gura": "gura", "umi-guracanvas": "guracanvas", "gura": "gura", "guracanvas": "guracanvas"}, "description": "Bikin efek canvas gura dari fotomu", "usage": ".gura (reply/kirim foto)", "example": ".gura", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/gura.js", metadata, m, extra)
handler.help = ["umi-canvas-gura (reply/kirim foto)"]
handler.command = ["umi-canvas-gura", "umi-gura", "umi-guracanvas", "gura", "guracanvas"]
handler.tags = ["canvas"]
handler.description = "Bikin efek canvas gura dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "gura", "alias": ["guracanvas"], "category": "canvas", "description": "Bikin efek canvas gura dari fotomu", "usage": ".gura (reply/kirim foto)", "example": ".gura", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-gura": "gura", "umi-gura": "gura", "umi-guracanvas": "guracanvas", "gura": "gura", "guracanvas": "guracanvas"}
export default handler
