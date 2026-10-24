import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeigstory", "category": "maker", "aliasMap": {"umi-maker-fakeigstory": "fakeigstory", "umi-fakeigstory": "fakeigstory", "umi-igstoryfake": "igstoryfake", "umi-fakeigs": "fakeigs", "fakeigstory": "fakeigstory", "igstoryfake": "igstoryfake", "fakeigs": "fakeigs"}, "description": "Membuat fake Instagram Story", "usage": ".fakeigstory <username>|<caption>|<time>", "example": ".fakeigstory zerobot|lagi gabut bjir|5 menit lalu", "cooldown": 5, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakeigstory.js", metadata, m, extra)
handler.help = ["umi-maker-fakeigstory <username>|<caption>|<time>"]
handler.command = ["umi-maker-fakeigstory", "umi-fakeigstory", "umi-igstoryfake", "umi-fakeigs", "fakeigstory", "igstoryfake", "fakeigs"]
handler.tags = ["maker"]
handler.description = "Membuat fake Instagram Story"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeigstory", "alias": ["igstoryfake", "fakeigs"], "category": "maker", "description": "Membuat fake Instagram Story", "usage": ".fakeigstory <username>|<caption>|<time>", "example": ".fakeigstory zerobot|lagi gabut bjir|5 menit lalu", "cooldown": 5, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakeigstory": "fakeigstory", "umi-fakeigstory": "fakeigstory", "umi-igstoryfake": "igstoryfake", "umi-fakeigs": "fakeigs", "fakeigstory": "fakeigstory", "igstoryfake": "igstoryfake", "fakeigs": "fakeigs"}
export default handler
