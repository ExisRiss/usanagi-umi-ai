/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "istikharah", "category": "religi", "aliasMap": {"umi-religi-istikharah": "istikharah", "umi-istikharah": "istikharah", "umi-sholatistikharah": "sholatistikharah", "umi-istikhoroh": "istikhoroh", "umi-istikharoh": "istikharoh", "istikharah": "istikharah", "sholatistikharah": "sholatistikharah", "istikhoroh": "istikhoroh", "istikharoh": "istikharoh"}, "description": "Panduan Sholat Istikharah lengkap (tata cara, doa, waktu, dan keutamaan)", "usage": ".istikharah", "example": ".istikharah", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/istikharah.js", metadata, m, extra)
handler.help = ["umi-religi-istikharah"]
handler.command = ["umi-religi-istikharah", "umi-istikharah", "umi-sholatistikharah", "umi-istikhoroh", "umi-istikharoh", "istikharah", "sholatistikharah", "istikhoroh", "istikharoh"]
handler.tags = ["religi"]
handler.description = "Panduan Sholat Istikharah lengkap (tata cara, doa, waktu, dan keutamaan)"
handler.importSource = "umi"
handler.importConfig = {"name": "istikharah", "alias": ["sholatistikharah", "istikhoroh", "istikharoh"], "category": "religi", "description": "Panduan Sholat Istikharah lengkap (tata cara, doa, waktu, dan keutamaan)", "usage": ".istikharah", "example": ".istikharah", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-istikharah": "istikharah", "umi-istikharah": "istikharah", "umi-sholatistikharah": "sholatistikharah", "umi-istikhoroh": "istikhoroh", "umi-istikharoh": "istikharoh", "istikharah": "istikharah", "sholatistikharah": "sholatistikharah", "istikhoroh": "istikhoroh", "istikharoh": "istikharoh"}
export default handler
