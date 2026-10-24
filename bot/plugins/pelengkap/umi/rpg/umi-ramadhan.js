/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ramadhan", "category": "rpg", "aliasMap": {"umi-rpg-ramadhan": "ramadhan", "umi-ramadhan": "ramadhan", "umi-bukapuasa": "bukapuasa", "umi-ngabuburit": "ngabuburit", "umi-tadarusan": "tadarusan", "umi-teraweh": "teraweh", "umi-belitakjil": "belitakjil", "umi-petasan": "petasan", "umi-mokel": "mokel", "umi-bangunin": "bangunin", "umi-bukber": "bukber", "umi-kelilingsahur": "kelilingsahur", "umi-patrol": "patrol", "umi-sedekah": "sedekah", "umi-thr": "thr", "umi-wartakjil": "wartakjil", "umi-bukawarung": "bukawarung", "ramadhan": "ramadhan", "bukapuasa": "bukapuasa", "ngabuburit": "ngabuburit", "tadarusan": "tadarusan", "teraweh": "teraweh", "belitakjil": "belitakjil", "petasan": "petasan", "mokel": "mokel", "bangunin": "bangunin", "bukber": "bukber", "kelilingsahur": "kelilingsahur", "patrol": "patrol", "sedekah": "sedekah", "thr": "thr", "wartakjil": "wartakjil", "bukawarung": "bukawarung"}, "description": "Fitur RPG Spesial Ramadhan", "usage": ".sahur | .bukapuasa | .ngabuburit | ...", "example": ".sahur", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/ramadhan.js", metadata, m, extra)
handler.help = ["umi-rpg-ramadhan | .bukapuasa | .ngabuburit | ..."]
handler.command = ["umi-rpg-ramadhan", "umi-ramadhan", "umi-bukapuasa", "umi-ngabuburit", "umi-tadarusan", "umi-teraweh", "umi-belitakjil", "umi-petasan", "umi-mokel", "umi-bangunin", "umi-bukber", "umi-kelilingsahur", "umi-patrol", "umi-sedekah", "umi-thr", "umi-wartakjil", "umi-bukawarung", "ramadhan", "bukapuasa", "ngabuburit", "tadarusan", "teraweh", "belitakjil", "petasan", "mokel", "bangunin", "bukber", "kelilingsahur", "patrol", "sedekah", "thr", "wartakjil", "bukawarung"]
handler.tags = ["rpg"]
handler.description = "Fitur RPG Spesial Ramadhan"
handler.importSource = "umi"
handler.importConfig = {"name": "ramadhan", "alias": ["bukapuasa", "ngabuburit", "tadarusan", "teraweh", "belitakjil", "petasan", "mokel", "bangunin", "bukber", "kelilingsahur", "patrol", "sedekah", "thr", "wartakjil", "bukawarung"], "category": "rpg", "description": "Fitur RPG Spesial Ramadhan", "usage": ".sahur | .bukapuasa | .ngabuburit | ...", "example": ".sahur", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-ramadhan": "ramadhan", "umi-ramadhan": "ramadhan", "umi-bukapuasa": "bukapuasa", "umi-ngabuburit": "ngabuburit", "umi-tadarusan": "tadarusan", "umi-teraweh": "teraweh", "umi-belitakjil": "belitakjil", "umi-petasan": "petasan", "umi-mokel": "mokel", "umi-bangunin": "bangunin", "umi-bukber": "bukber", "umi-kelilingsahur": "kelilingsahur", "umi-patrol": "patrol", "umi-sedekah": "sedekah", "umi-thr": "thr", "umi-wartakjil": "wartakjil", "umi-bukawarung": "bukawarung", "ramadhan": "ramadhan", "bukapuasa": "bukapuasa", "ngabuburit": "ngabuburit", "tadarusan": "tadarusan", "teraweh": "teraweh", "belitakjil": "belitakjil", "petasan": "petasan", "mokel": "mokel", "bangunin": "bangunin", "bukber": "bukber", "kelilingsahur": "kelilingsahur", "patrol": "patrol", "sedekah": "sedekah", "thr": "thr", "wartakjil": "wartakjil", "bukawarung": "bukawarung"}
export default handler
