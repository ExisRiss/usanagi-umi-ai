import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeig", "category": "maker", "aliasMap": {"umi-maker-fakeig": "fakeig", "umi-fakeig": "fakeig", "umi-fakeigprofile": "fakeigprofile", "umi-igprofilememe": "igprofilememe", "fakeig": "fakeig", "fakeigprofile": "fakeigprofile", "igprofilememe": "igprofilememe"}, "description": "Membuat gambar Fake Profile Instagram", "usage": ".fakeig Username | Bio | Postingan | Pengikut | Mengikuti (reply foto)", "example": ".fakeig King Jenn 👑 | Halo semuanyahh | 12 | 1.123 | 12", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakeigprofile.js", metadata, m, extra)
handler.help = ["umi-maker-fakeig Username | Bio | Postingan | Pengikut | Mengikuti (reply foto)"]
handler.command = ["umi-maker-fakeig", "umi-fakeig", "umi-fakeigprofile", "umi-igprofilememe", "fakeig", "fakeigprofile", "igprofilememe"]
handler.tags = ["maker"]
handler.description = "Membuat gambar Fake Profile Instagram"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeig", "alias": ["fakeigprofile", "igprofilememe"], "category": "maker", "description": "Membuat gambar Fake Profile Instagram", "usage": ".fakeig Username | Bio | Postingan | Pengikut | Mengikuti (reply foto)", "example": ".fakeig King Jenn 👑 | Halo semuanyahh | 12 | 1.123 | 12", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakeig": "fakeig", "umi-fakeig": "fakeig", "umi-fakeigprofile": "fakeigprofile", "umi-igprofilememe": "igprofilememe", "fakeig": "fakeig", "fakeigprofile": "fakeigprofile", "igprofilememe": "igprofilememe"}
export default handler
