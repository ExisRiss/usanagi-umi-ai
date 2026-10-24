import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nikparser", "category": "tools", "aliasMap": {"umi-tools-nikparser": "nikparser", "umi-nikparser": "nikparser", "umi-nik": "nik", "umi-ceknik": "ceknik", "nikparser": "nikparser", "nik": "nik", "ceknik": "ceknik"}, "description": "Parse dan validasi NIK KTP", "usage": ".nikparser <16 digit NIK>", "example": ".nikparser 3517072109020003", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/nikparser.js", metadata, m, extra)
handler.help = ["umi-tools-nikparser <16 digit NIK>"]
handler.command = ["umi-tools-nikparser", "umi-nikparser", "umi-nik", "umi-ceknik", "nikparser", "nik", "ceknik"]
handler.tags = ["tools"]
handler.description = "Parse dan validasi NIK KTP"
handler.importSource = "umi"
handler.importConfig = {"name": "nikparser", "alias": ["nik", "ceknik"], "category": "tools", "description": "Parse dan validasi NIK KTP", "usage": ".nikparser <16 digit NIK>", "example": ".nikparser 3517072109020003", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-nikparser": "nikparser", "umi-nikparser": "nikparser", "umi-nik": "nik", "umi-ceknik": "ceknik", "nikparser": "nikparser", "nik": "nik", "ceknik": "ceknik"}
export default handler
