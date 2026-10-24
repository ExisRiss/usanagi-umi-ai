/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kurangisaldo", "category": "store_autoorder", "aliasMap": {"umi-store_autoorder-kurangisaldo": "kurangisaldo", "umi-kurangisaldo": "kurangisaldo", "umi-delsaldo": "delsaldo", "umi-minussaldo": "minussaldo", "kurangisaldo": "kurangisaldo", "delsaldo": "delsaldo", "minussaldo": "minussaldo"}, "description": "💰 Mengurangi saldo pengguna secara manual", "usage": ".kurangisaldo @user <nominal>", "example": ".kurangisaldo @user 10000", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store_autoorder/kurangisaldo.js", metadata, m, extra)
handler.help = ["umi-store_autoorder-kurangisaldo @user <nominal>"]
handler.command = ["umi-store_autoorder-kurangisaldo", "umi-kurangisaldo", "umi-delsaldo", "umi-minussaldo", "kurangisaldo", "delsaldo", "minussaldo"]
handler.tags = ["store_autoorder"]
handler.description = "💰 Mengurangi saldo pengguna secara manual"
handler.importSource = "umi"
handler.importConfig = {"name": "kurangisaldo", "alias": ["delsaldo", "minussaldo"], "category": "store_autoorder", "description": "💰 Mengurangi saldo pengguna secara manual", "usage": ".kurangisaldo @user <nominal>", "example": ".kurangisaldo @user 10000", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store_autoorder-kurangisaldo": "kurangisaldo", "umi-kurangisaldo": "kurangisaldo", "umi-delsaldo": "delsaldo", "umi-minussaldo": "minussaldo", "kurangisaldo": "kurangisaldo", "delsaldo": "delsaldo", "minussaldo": "minussaldo"}
export default handler
