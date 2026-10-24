import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakekarcis", "category": "canvas", "aliasMap": {"umi-canvas-fakekarcis": "fakekarcis", "umi-fakekarcis": "fakekarcis", "umi-karcisfake": "karcisfake", "umi-tiketbioskop": "tiketbioskop", "umi-faketiketfilm": "faketiketfilm", "fakekarcis": "fakekarcis", "karcisfake": "karcisfake", "tiketbioskop": "tiketbioskop", "faketiketfilm": "faketiketfilm"}, "description": "Bikin fake karcis bioskop (buat konten/gaguan doang)", "usage": ".fakekarcis <nama> | <film> | <jam>", "example": ".fakekarcis Umi | DITF The Movie | 21:00", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakekarcis.js", metadata, m, extra)
handler.help = ["umi-canvas-fakekarcis <nama> | <film> | <jam>"]
handler.command = ["umi-canvas-fakekarcis", "umi-fakekarcis", "umi-karcisfake", "umi-tiketbioskop", "umi-faketiketfilm", "fakekarcis", "karcisfake", "tiketbioskop", "faketiketfilm"]
handler.tags = ["canvas"]
handler.description = "Bikin fake karcis bioskop (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakekarcis", "alias": ["karcisfake", "tiketbioskop", "faketiketfilm"], "category": "canvas", "description": "Bikin fake karcis bioskop (buat konten/gaguan doang)", "usage": ".fakekarcis <nama> | <film> | <jam>", "example": ".fakekarcis Umi | DITF The Movie | 21:00", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakekarcis": "fakekarcis", "umi-fakekarcis": "fakekarcis", "umi-karcisfake": "karcisfake", "umi-tiketbioskop": "tiketbioskop", "umi-faketiketfilm": "faketiketfilm", "fakekarcis": "fakekarcis", "karcisfake": "karcisfake", "tiketbioskop": "tiketbioskop", "faketiketfilm": "faketiketfilm"}
export default handler
