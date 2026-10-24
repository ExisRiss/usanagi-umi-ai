import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wa-canvas", "category": "fun", "aliasMap": {"umi-fun-wa-canvas": "wa-canvas", "umi-wa-canvas": "wa-canvas", "umi-fakewaprofile": "fakewaprofile", "wa-canvas": "wa-canvas", "fakewaprofile": "fakewaprofile"}, "description": "Buat fake WhatsApp profile card", "usage": ".wa-canvas <nama> | <nomor> | [status]", "example": ".wa-canvas John Doe | 6281234567890 | Available", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/wa-canvas.js", metadata, m, extra)
handler.help = ["umi-fun-wa-canvas <nama> | <nomor> | [status]"]
handler.command = ["umi-fun-wa-canvas", "umi-wa-canvas", "umi-fakewaprofile", "wa-canvas", "fakewaprofile"]
handler.tags = ["fun"]
handler.description = "Buat fake WhatsApp profile card"
handler.importSource = "umi"
handler.importConfig = {"name": "wa-canvas", "alias": ["fakewaprofile"], "category": "fun", "description": "Buat fake WhatsApp profile card", "usage": ".wa-canvas <nama> | <nomor> | [status]", "example": ".wa-canvas John Doe | 6281234567890 | Available", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-wa-canvas": "wa-canvas", "umi-wa-canvas": "wa-canvas", "umi-fakewaprofile": "fakewaprofile", "wa-canvas": "wa-canvas", "fakewaprofile": "fakewaprofile"}
export default handler
