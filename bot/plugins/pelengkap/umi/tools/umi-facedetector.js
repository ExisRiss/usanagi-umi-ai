import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "facedetector", "category": "tools", "aliasMap": {"umi-tools-facedetector": "facedetector", "umi-facedetector": "facedetector", "umi-facedetect": "facedetect", "umi-detectface": "detectface", "umi-deteksiwajah": "deteksiwajah", "facedetector": "facedetector", "facedetect": "facedetect", "detectface": "detectface", "deteksiwajah": "deteksiwajah"}, "description": "Mendeteksi wajah pada gambar", "usage": ".facedetector (reply gambar)", "example": ".facedetector", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/facedetector.js", metadata, m, extra)
handler.help = ["umi-tools-facedetector (reply gambar)"]
handler.command = ["umi-tools-facedetector", "umi-facedetector", "umi-facedetect", "umi-detectface", "umi-deteksiwajah", "facedetector", "facedetect", "detectface", "deteksiwajah"]
handler.tags = ["tools"]
handler.description = "Mendeteksi wajah pada gambar"
handler.importSource = "umi"
handler.importConfig = {"name": "facedetector", "alias": ["facedetect", "detectface", "deteksiwajah"], "category": "tools", "description": "Mendeteksi wajah pada gambar", "usage": ".facedetector (reply gambar)", "example": ".facedetector", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-facedetector": "facedetector", "umi-facedetector": "facedetector", "umi-facedetect": "facedetect", "umi-detectface": "detectface", "umi-deteksiwajah": "deteksiwajah", "facedetector": "facedetector", "facedetect": "facedetect", "detectface": "detectface", "deteksiwajah": "deteksiwajah"}
export default handler
