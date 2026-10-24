/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakegroup", "category": "maker", "aliasMap": {"umi-maker-fakegroup": "fakegroup", "umi-fakegroup": "fakegroup", "umi-fgc": "fgc", "fakegroup": "fakegroup", "fgc": "fgc"}, "description": "Membuat fake tampilan grup WhatsApp", "usage": ".fakegroup <url|title|member|time>", "example": ".fakegroup https://img.jpg|Zero Squad|256 members|12:30", "cooldown": 5, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/fakegroup.js", metadata, m, extra)
handler.help = ["umi-maker-fakegroup <url|title|member|time>"]
handler.command = ["umi-maker-fakegroup", "umi-fakegroup", "umi-fgc", "fakegroup", "fgc"]
handler.tags = ["maker"]
handler.description = "Membuat fake tampilan grup WhatsApp"
handler.importSource = "umi"
handler.importConfig = {"name": "fakegroup", "alias": ["fgc"], "category": "maker", "description": "Membuat fake tampilan grup WhatsApp", "usage": ".fakegroup <url|title|member|time>", "example": ".fakegroup https://img.jpg|Zero Squad|256 members|12:30", "cooldown": 5, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-fakegroup": "fakegroup", "umi-fakegroup": "fakegroup", "umi-fgc": "fgc", "fakegroup": "fakegroup", "fgc": "fgc"}
export default handler
