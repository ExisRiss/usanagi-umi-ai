/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gdrive", "category": "download", "aliasMap": {"umi-download-gdrive": "gdrive", "umi-gdrive": "gdrive", "umi-drive": "drive", "umi-drivedl": "drivedl", "umi-driveurl": "driveurl", "drive": "drive", "drivedl": "drivedl", "driveurl": "driveurl"}, "description": "Download file dari Google Drive", "usage": ".gdrive <url>", "example": ".gdrive https://drive.google.com/file/d/xxx/view", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/gdrive.js", metadata, m, extra)
handler.help = ["umi-download-gdrive <url>"]
handler.command = ["umi-download-gdrive", "umi-gdrive", "umi-drive", "umi-drivedl", "umi-driveurl", "drive", "drivedl", "driveurl"]
handler.tags = ["download"]
handler.description = "Download file dari Google Drive"
handler.importSource = "umi"
handler.importConfig = {"name": "gdrive", "alias": ["drive", "drivedl", "driveurl"], "category": "download", "description": "Download file dari Google Drive", "usage": ".gdrive <url>", "example": ".gdrive https://drive.google.com/file/d/xxx/view", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-gdrive": "gdrive", "umi-gdrive": "gdrive", "umi-drive": "drive", "umi-drivedl": "drivedl", "umi-driveurl": "driveurl", "drive": "drive", "drivedl": "drivedl", "driveurl": "driveurl"}
export default handler
