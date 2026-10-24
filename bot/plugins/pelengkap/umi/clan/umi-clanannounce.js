/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanannounce", "category": "clan", "aliasMap": {"umi-clan-clanannounce": "clanannounce", "umi-clanannounce": "clanannounce", "umi-announce": "announce", "umi-clanbroadcast": "clanbroadcast", "umi-pengumuman": "pengumuman", "clanannounce": "clanannounce", "announce": "announce", "clanbroadcast": "clanbroadcast", "pengumuman": "pengumuman"}, "description": "Kirim pengumuman ke semua member clan", "usage": ".clanannounce <pesan>", "example": ".clanannounce Besok ada event war!", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanannounce.js", metadata, m, extra)
handler.help = ["umi-clan-clanannounce <pesan>"]
handler.command = ["umi-clan-clanannounce", "umi-clanannounce", "umi-announce", "umi-clanbroadcast", "umi-pengumuman", "clanannounce", "announce", "clanbroadcast", "pengumuman"]
handler.tags = ["clan"]
handler.description = "Kirim pengumuman ke semua member clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanannounce", "alias": ["announce", "clanbroadcast", "pengumuman"], "category": "clan", "description": "Kirim pengumuman ke semua member clan", "usage": ".clanannounce <pesan>", "example": ".clanannounce Besok ada event war!", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanannounce": "clanannounce", "umi-clanannounce": "clanannounce", "umi-announce": "announce", "umi-clanbroadcast": "clanbroadcast", "umi-pengumuman": "pengumuman", "clanannounce": "clanannounce", "announce": "announce", "clanbroadcast": "clanbroadcast", "pengumuman": "pengumuman"}
export default handler
