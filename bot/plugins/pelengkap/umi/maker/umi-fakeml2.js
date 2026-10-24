/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeml2", "category": "maker", "aliasMap": {"umi-maker-fakeml2": "fakeml2", "umi-fakeml2": "fakeml2", "umi-mlfake2": "mlfake2", "umi-fakecardml2": "fakecardml2", "umi-profileml2": "profileml2", "fakeml2": "fakeml2", "mlfake2": "mlfake2", "fakecardml2": "fakecardml2", "profileml2": "profileml2"}, "description": "Membuat kartu profil Mobile Legends palsu (v2)", "usage": ".fakeml2 username|rank|border (reply/kirim foto untuk avatar)", "example": ".fakeml2 AlwaysCodex|imo|10", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakeml2.js", metadata, m, extra)
handler.help = ["umi-maker-fakeml2 username|rank|border (reply/kirim foto untuk avatar)"]
handler.command = ["umi-maker-fakeml2", "umi-fakeml2", "umi-mlfake2", "umi-fakecardml2", "umi-profileml2", "fakeml2", "mlfake2", "fakecardml2", "profileml2"]
handler.tags = ["maker"]
handler.description = "Membuat kartu profil Mobile Legends palsu (v2)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeml2", "alias": ["mlfake2", "fakecardml2", "profileml2"], "category": "maker", "description": "Membuat kartu profil Mobile Legends palsu (v2)", "usage": ".fakeml2 username|rank|border (reply/kirim foto untuk avatar)", "example": ".fakeml2 AlwaysCodex|imo|10", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakeml2": "fakeml2", "umi-fakeml2": "fakeml2", "umi-mlfake2": "mlfake2", "umi-fakecardml2": "fakecardml2", "umi-profileml2": "profileml2", "fakeml2": "fakeml2", "mlfake2": "mlfake2", "fakecardml2": "fakecardml2", "profileml2": "profileml2"}
export default handler
