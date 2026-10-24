/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceksocmed", "category": "cek", "aliasMap": {"umi-cek-ceksocmed": "ceksocmed", "umi-ceksocmed": "ceksocmed", "umi-sosmed": "sosmed", "umi-medsos": "medsos", "sosmed": "sosmed", "medsos": "medsos"}, "description": "Cek tingkat kecanduan sosmed", "usage": ".ceksocmed <nama>", "example": ".ceksocmed Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/ceksocmed.js", metadata, m, extra)
handler.help = ["umi-cek-ceksocmed <nama>"]
handler.command = ["umi-cek-ceksocmed", "umi-ceksocmed", "umi-sosmed", "umi-medsos", "sosmed", "medsos"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kecanduan sosmed"
handler.importSource = "umi"
handler.importConfig = {"name": "ceksocmed", "alias": ["sosmed", "medsos"], "category": "cek", "description": "Cek tingkat kecanduan sosmed", "usage": ".ceksocmed <nama>", "example": ".ceksocmed Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-ceksocmed": "ceksocmed", "umi-ceksocmed": "ceksocmed", "umi-sosmed": "sosmed", "umi-medsos": "medsos", "sosmed": "sosmed", "medsos": "medsos"}
export default handler
