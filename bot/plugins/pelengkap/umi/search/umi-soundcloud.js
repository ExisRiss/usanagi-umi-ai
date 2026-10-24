import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "soundcloud", "category": "search", "aliasMap": {"umi-search-soundcloud": "soundcloud", "umi-soundcloud": "soundcloud", "umi-scsearch": "scsearch", "umi-scs": "scs", "scsearch": "scsearch", "scs": "scs"}, "description": "Cari lagu di SoundCloud", "usage": ".soundcloud judul", "example": ".soundcloud Only We Know", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/soundcloud.js", metadata, m, extra)
handler.help = ["umi-search-soundcloud judul"]
handler.command = ["umi-search-soundcloud", "umi-soundcloud", "umi-scsearch", "umi-scs", "scsearch", "scs"]
handler.tags = ["search"]
handler.description = "Cari lagu di SoundCloud"
handler.importSource = "umi"
handler.importConfig = {"name": "soundcloud", "alias": ["scsearch", "scs"], "category": "search", "description": "Cari lagu di SoundCloud", "usage": ".soundcloud judul", "example": ".soundcloud Only We Know", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-soundcloud": "soundcloud", "umi-soundcloud": "soundcloud", "umi-scsearch": "scsearch", "umi-scs": "scs", "scsearch": "scsearch", "scs": "scs"}
export default handler
