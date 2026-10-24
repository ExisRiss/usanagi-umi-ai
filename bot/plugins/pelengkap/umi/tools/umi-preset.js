/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "preset", "category": "tools", "aliasMap": {"umi-tools-preset": "preset", "umi-preset": "preset", "umi-prst": "prst", "preset": "preset", "prst": "prst"}, "description": "Generate teks preset auto copy 😈", "usage": ".preset linkVT|link916|link11|linkXML", "example": ".preset https://vt|https://916|https://11|https://xml", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/preset.js", metadata, m, extra)
handler.help = ["umi-tools-preset linkVT|link916|link11|linkXML"]
handler.command = ["umi-tools-preset", "umi-preset", "umi-prst", "preset", "prst"]
handler.tags = ["tools"]
handler.description = "Generate teks preset auto copy 😈"
handler.importSource = "umi"
handler.importConfig = {"name": "preset", "alias": ["prst"], "category": "tools", "description": "Generate teks preset auto copy 😈", "usage": ".preset linkVT|link916|link11|linkXML", "example": ".preset https://vt|https://916|https://11|https://xml", "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-preset": "preset", "umi-preset": "preset", "umi-prst": "prst", "preset": "preset", "prst": "prst"}
export default handler
