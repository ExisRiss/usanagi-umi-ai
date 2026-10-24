import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gimage", "category": "downloads", "aliasMap": {"umi-downloads-gimage": "gimage", "umi-gimage": "gimage", "umi-googleimage": "googleimage", "umi-image": "image", "gimage": "gimage", "googleimage": "googleimage", "image": "image"}, "description": "Mencari dan mendownload gambar dari Google", "usage": ".gimage [nama gambar]", "example": ".gimage pemandangan aesthetic", "cooldown": 5, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/downloads/gimage.js", metadata, m, extra)
handler.help = ["umi-downloads-gimage [nama gambar]"]
handler.command = ["umi-downloads-gimage", "umi-gimage", "umi-googleimage", "umi-image", "gimage", "googleimage", "image"]
handler.tags = ["downloads"]
handler.description = "Mencari dan mendownload gambar dari Google"
handler.importSource = "umi"
handler.importConfig = {"name": "gimage", "alias": ["googleimage", "image"], "category": "downloads", "description": "Mencari dan mendownload gambar dari Google", "usage": ".gimage [nama gambar]", "example": ".gimage pemandangan aesthetic", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-downloads-gimage": "gimage", "umi-gimage": "gimage", "umi-googleimage": "googleimage", "umi-image": "image", "gimage": "gimage", "googleimage": "googleimage", "image": "image"}
export default handler
