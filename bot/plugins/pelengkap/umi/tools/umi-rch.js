import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rch", "category": "tools", "aliasMap": {"umi-tools-rch": "rch", "umi-rch": "rch", "umi-frch": "frch", "umi-reactch": "reactch", "umi-fakereactch": "fakereactch", "umi-fakerch": "fakerch", "frch": "frch", "reactch": "reactch", "fakereactch": "fakereactch", "fakerch": "fakerch"}, "description": "Kirim react ke post channel WhatsApp", "usage": ".rch <link_post> <emoji>", "example": ".rch https://whatsapp.com/channel/RIMURU_CHANNEL 😂😍", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/rch.js", metadata, m, extra)
handler.help = ["umi-tools-rch <link_post> <emoji>"]
handler.command = ["umi-tools-rch", "umi-rch", "umi-frch", "umi-reactch", "umi-fakereactch", "umi-fakerch", "frch", "reactch", "fakereactch", "fakerch"]
handler.tags = ["tools"]
handler.description = "Kirim react ke post channel WhatsApp"
handler.importSource = "umi"
handler.importConfig = {"name": "rch", "alias": ["frch", "reactch", "fakereactch", "fakerch"], "category": "tools", "description": "Kirim react ke post channel WhatsApp", "usage": ".rch <link_post> <emoji>", "example": ".rch https://whatsapp.com/channel/RIMURU_CHANNEL 😂😍", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-rch": "rch", "umi-rch": "rch", "umi-frch": "frch", "umi-reactch": "reactch", "umi-fakereactch": "fakereactch", "umi-fakerch": "fakerch", "frch": "frch", "reactch": "reactch", "fakereactch": "fakereactch", "fakerch": "fakerch"}
export default handler
