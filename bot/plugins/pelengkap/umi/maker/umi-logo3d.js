/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "logo-3d", "category": "maker", "aliasMap": {"umi-maker-logo-3d": "logo-3d", "umi-logo-3d": "logo-3d", "umi-logo3d": "logo3d", "umi-3dlogo": "3dlogo", "umi-3dtext": "3dtext", "logo-3d": "logo-3d", "logo3d": "logo3d", "3dlogo": "3dlogo", "3dtext": "3dtext"}, "description": "Buat logo dengan efek 3D pop out", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/logo3d.js", metadata, m, extra)
handler.help = ["umi-maker-logo-3d"]
handler.command = ["umi-maker-logo-3d", "umi-logo-3d", "umi-logo3d", "umi-3dlogo", "umi-3dtext", "logo-3d", "logo3d", "3dlogo", "3dtext"]
handler.tags = ["maker"]
handler.description = "Buat logo dengan efek 3D pop out"
handler.importSource = "umi"
handler.importConfig = {"name": "logo-3d", "alias": ["logo3d", "3dlogo", "3dtext"], "category": "maker", "description": "Buat logo dengan efek 3D pop out", "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-logo-3d": "logo-3d", "umi-logo-3d": "logo-3d", "umi-logo3d": "logo3d", "umi-3dlogo": "3dlogo", "umi-3dtext": "3dtext", "logo-3d": "logo-3d", "logo3d": "logo3d", "3dlogo": "3dlogo", "3dtext": "3dtext"}
export default handler
