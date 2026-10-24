import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "remind", "category": "utility", "aliasMap": {"umi-utility-remind": "remind", "umi-remind": "remind", "umi-reminder": "reminder", "umi-ingatkan": "ingatkan", "remind": "remind", "reminder": "reminder", "ingatkan": "ingatkan"}, "description": "Membuat pengingat otomatis dengan durasi waktu tertentu", "usage": ".remind <waktu> <pesan>", "example": ".remind 30m Meeting dengan klien", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/utility/reminder.js", metadata, m, extra)
handler.help = ["umi-utility-remind <waktu> <pesan>"]
handler.command = ["umi-utility-remind", "umi-remind", "umi-reminder", "umi-ingatkan", "remind", "reminder", "ingatkan"]
handler.tags = ["utility"]
handler.description = "Membuat pengingat otomatis dengan durasi waktu tertentu"
handler.importSource = "umi"
handler.importConfig = {"name": "remind", "alias": ["reminder", "ingatkan"], "category": "utility", "description": "Membuat pengingat otomatis dengan durasi waktu tertentu", "usage": ".remind <waktu> <pesan>", "example": ".remind 30m Meeting dengan klien", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-utility-remind": "remind", "umi-remind": "remind", "umi-reminder": "reminder", "umi-ingatkan": "ingatkan", "remind": "remind", "reminder": "reminder", "ingatkan": "ingatkan"}
export default handler
