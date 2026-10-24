/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "amverif", "category": "tools", "aliasMap": {"umi-tools-amverif": "amverif", "umi-amverif": "amverif", "umi-ampverif": "ampverif", "umi-verifyam": "verifyam", "umi-amverify": "amverify", "amverif": "amverif", "ampverif": "ampverif", "verifyam": "verifyam", "amverify": "amverify"}, "description": "Alias: verifikasi AM (pakai .amprem)", "usage": ".amverif → gunakan .amprem", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/amverif.js", metadata, m, extra)
handler.help = ["umi-tools-amverif → gunakan .amprem"]
handler.command = ["umi-tools-amverif", "umi-amverif", "umi-ampverif", "umi-verifyam", "umi-amverify", "amverif", "ampverif", "verifyam", "amverify"]
handler.tags = ["tools"]
handler.description = "Alias: verifikasi AM (pakai .amprem)"
handler.importSource = "umi"
handler.importConfig = {"name": "amverif", "alias": ["ampverif", "verifyam", "amverify"], "category": "tools", "description": "Alias: verifikasi AM (pakai .amprem)", "usage": ".amverif → gunakan .amprem", "isOwner": false, "isPremium": false, "isEnabled": true, "cooldown": 5}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-amverif": "amverif", "umi-amverif": "amverif", "umi-ampverif": "ampverif", "umi-verifyam": "verifyam", "umi-amverify": "amverify", "amverif": "amverif", "ampverif": "ampverif", "verifyam": "verifyam", "amverify": "amverify"}
export default handler
