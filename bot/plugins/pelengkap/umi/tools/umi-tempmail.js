/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tempmail", "category": "tools", "aliasMap": {"umi-tools-tempmail": "tempmail", "umi-tempmail": "tempmail", "umi-tmpmail": "tmpmail", "umi-tmp": "tmp", "umi-trashmail": "trashmail", "tmpmail": "tmpmail", "tmp": "tmp", "trashmail": "trashmail"}, "description": "Buat email sementara & cek inbox", "usage": ".tempmail create/inbox", "example": ".tempmail create", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/tempmail.js", metadata, m, extra)
handler.help = ["umi-tools-tempmail create/inbox"]
handler.command = ["umi-tools-tempmail", "umi-tempmail", "umi-tmpmail", "umi-tmp", "umi-trashmail", "tmpmail", "tmp", "trashmail"]
handler.tags = ["tools"]
handler.description = "Buat email sementara & cek inbox"
handler.importSource = "umi"
handler.importConfig = {"name": "tempmail", "alias": ["tmpmail", "tmp", "trashmail"], "category": "tools", "description": "Buat email sementara & cek inbox", "usage": ".tempmail create/inbox", "example": ".tempmail create", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-tempmail": "tempmail", "umi-tempmail": "tempmail", "umi-tmpmail": "tmpmail", "umi-tmp": "tmp", "umi-trashmail": "trashmail", "tmpmail": "tmpmail", "tmp": "tmp", "trashmail": "trashmail"}
export default handler
