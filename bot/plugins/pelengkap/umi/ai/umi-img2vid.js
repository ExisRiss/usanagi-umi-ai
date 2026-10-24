/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "img2vid", "category": "ai", "aliasMap": {"umi-ai-img2vid": "img2vid", "umi-img2vid": "img2vid", "umi-image2video": "image2video", "umi-animateimg": "animateimg", "umi-animatephoto": "animatephoto", "image2video": "image2video", "animateimg": "animateimg", "animatephoto": "animatephoto"}, "description": "Ubah gambar jadi video dengan AI", "usage": ".img2vid <prompt> (reply gambar)", "example": ".img2vid Animate my photo", "cooldown": 60, "energi": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/img2vid.js", metadata, m, extra)
handler.help = ["umi-ai-img2vid <prompt> (reply gambar)"]
handler.command = ["umi-ai-img2vid", "umi-img2vid", "umi-image2video", "umi-animateimg", "umi-animatephoto", "image2video", "animateimg", "animatephoto"]
handler.tags = ["ai"]
handler.description = "Ubah gambar jadi video dengan AI"
handler.importSource = "umi"
handler.importConfig = {"name": "img2vid", "alias": ["image2video", "animateimg", "animatephoto"], "category": "ai", "description": "Ubah gambar jadi video dengan AI", "usage": ".img2vid <prompt> (reply gambar)", "example": ".img2vid Animate my photo", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-img2vid": "img2vid", "umi-img2vid": "img2vid", "umi-image2video": "image2video", "umi-animateimg": "animateimg", "umi-animatephoto": "animatephoto", "image2video": "image2video", "animateimg": "animateimg", "animatephoto": "animatephoto"}
export default handler
