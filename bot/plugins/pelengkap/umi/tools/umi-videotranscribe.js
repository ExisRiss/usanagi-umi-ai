/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "videotranscribe", "category": "tools", "aliasMap": {"umi-tools-videotranscribe": "videotranscribe", "umi-videotranscribe": "videotranscribe", "umi-video-transcribe": "video-transcribe", "umi-transkripvideo": "transkripvideo", "videotranscribe": "videotranscribe", "video-transcribe": "video-transcribe", "transkripvideo": "transkripvideo"}, "description": "Transkrip video dari URL menjadi teks (YouTube, mp4, dll)", "usage": ".video-transcribe <url> [lang]", "example": ".video-transcribe https://youtu.be/dQw4w9WgXcQ\n.video-transcribe https://youtu.be/dQw4w9WgXcQ id", "cooldown": 30, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/videotranscribe.js", metadata, m, extra)
handler.help = ["umi-tools-videotranscribe <url> [lang]"]
handler.command = ["umi-tools-videotranscribe", "umi-videotranscribe", "umi-video-transcribe", "umi-transkripvideo", "videotranscribe", "video-transcribe", "transkripvideo"]
handler.tags = ["tools"]
handler.description = "Transkrip video dari URL menjadi teks (YouTube, mp4, dll)"
handler.importSource = "umi"
handler.importConfig = {"name": "videotranscribe", "alias": ["video-transcribe", "transkripvideo"], "category": "tools", "description": "Transkrip video dari URL menjadi teks (YouTube, mp4, dll)", "usage": ".video-transcribe <url> [lang]", "example": ".video-transcribe https://youtu.be/dQw4w9WgXcQ\n.video-transcribe https://youtu.be/dQw4w9WgXcQ id", "cooldown": 30, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-videotranscribe": "videotranscribe", "umi-videotranscribe": "videotranscribe", "umi-video-transcribe": "video-transcribe", "umi-transkripvideo": "transkripvideo", "videotranscribe": "videotranscribe", "video-transcribe": "video-transcribe", "transkripvideo": "transkripvideo"}
export default handler
