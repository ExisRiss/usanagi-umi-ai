/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "faketag", "category": "tools", "aliasMap": {"umi-tools-faketag": "faketag", "umi-faketag": "faketag", "umi-ftag": "ftag", "umi-fake": "fake", "faketag": "faketag", "ftag": "ftag", "fake": "fake"}, "description": "Fake tag ala Umi", "usage": ".faketag @user|pesan tag|pesan", "example": ".faketag 628xxx|Darling...|Kamu dimana? 💕", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/faketag.js", metadata, m, extra)
handler.help = ["umi-tools-faketag @user|pesan tag|pesan"]
handler.command = ["umi-tools-faketag", "umi-faketag", "umi-ftag", "umi-fake", "faketag", "ftag", "fake"]
handler.tags = ["tools"]
handler.description = "Fake tag ala Umi"
handler.importSource = "umi"
handler.importConfig = {"name": "faketag", "alias": ["ftag", "fake"], "category": "tools", "description": "Fake tag ala Umi", "usage": ".faketag @user|pesan tag|pesan", "example": ".faketag 628xxx|Darling...|Kamu dimana? 💕", "cooldown": 5, "isGroup": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-faketag": "faketag", "umi-faketag": "faketag", "umi-ftag": "ftag", "umi-fake": "fake", "faketag": "faketag", "ftag": "ftag", "fake": "fake"}
export default handler
