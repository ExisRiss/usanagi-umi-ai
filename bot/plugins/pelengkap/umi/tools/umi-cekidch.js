import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekidch", "category": "tools", "aliasMap": {"umi-tools-cekidch": "cekidch", "umi-cekidch": "cekidch", "umi-idch": "idch", "umi-channelid": "channelid", "umi-infoch": "infoch", "idch": "idch", "channelid": "channelid", "infoch": "infoch", "channelinfo": "channelinfo"}, "description": "Cek ID dan info lengkap channel dari link", "usage": ".cekidch <link channel>", "example": ".cekidch https://whatsapp.com/channel/xxxxx", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/cekidch.js", metadata, m, extra)
handler.help = ["umi-tools-cekidch <link channel>"]
handler.command = ["umi-tools-cekidch", "umi-cekidch", "umi-idch", "umi-channelid", "umi-infoch", "idch", "channelid", "infoch", "channelinfo"]
handler.tags = ["tools"]
handler.description = "Cek ID dan info lengkap channel dari link"
handler.importSource = "umi"
handler.importConfig = {"name": "cekidch", "alias": ["idch", "channelid", "infoch", "channelinfo"], "category": "tools", "description": "Cek ID dan info lengkap channel dari link", "usage": ".cekidch <link channel>", "example": ".cekidch https://whatsapp.com/channel/xxxxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-cekidch": "cekidch", "umi-cekidch": "cekidch", "umi-idch": "idch", "umi-channelid": "channelid", "umi-infoch": "infoch", "idch": "idch", "channelid": "channelid", "infoch": "infoch", "channelinfo": "channelinfo"}
export default handler
