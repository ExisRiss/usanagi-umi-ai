import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "referal", "category": "user", "aliasMap": {"umi-user-referal": "referal", "umi-referal": "referal", "umi-referral": "referral", "umi-refer": "refer", "umi-ref": "ref", "referal": "referal", "referral": "referral", "refer": "refer", "ref": "ref"}, "description": "Sistem kode referral untuk mendapatkan EXP", "usage": ".referal [kode]", "example": ".referal atau .referal ABC123XYZ", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/referal.js", metadata, m, extra)
handler.help = ["umi-user-referal [kode]"]
handler.command = ["umi-user-referal", "umi-referal", "umi-referral", "umi-refer", "umi-ref", "referal", "referral", "refer", "ref"]
handler.tags = ["user"]
handler.description = "Sistem kode referral untuk mendapatkan EXP"
handler.importSource = "umi"
handler.importConfig = {"name": "referal", "alias": ["referral", "refer", "ref"], "category": "user", "description": "Sistem kode referral untuk mendapatkan EXP", "usage": ".referal [kode]", "example": ".referal atau .referal ABC123XYZ", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-referal": "referal", "umi-referal": "referal", "umi-referral": "referral", "umi-refer": "refer", "umi-ref": "ref", "referal": "referal", "referral": "referral", "refer": "refer", "ref": "ref"}
export default handler
