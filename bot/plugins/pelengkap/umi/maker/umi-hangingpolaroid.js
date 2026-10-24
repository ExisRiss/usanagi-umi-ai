import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hangingpolaroid", "category": "maker", "aliasMap": {"umi-maker-hangingpolaroid": "hangingpolaroid", "umi-hangingpolaroid": "hangingpolaroid", "umi-polaroid2": "polaroid2", "umi-pola": "pola", "umi-bingkai": "bingkai", "umi-frame": "frame", "hangingpolaroid": "hangingpolaroid", "polaroid2": "polaroid2", "pola": "pola", "bingkai": "bingkai", "frame": "frame"}, "description": "Membuat foto bingkai Polaroid gantung yang otomatis menyesuaikan ukuran foto asli (Responsive pure SVG)", "usage": ".pola (Kirim/Reply Foto)", "example": ".pola"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/hangingpolaroid.js", metadata, m, extra)
handler.help = ["umi-maker-hangingpolaroid (Kirim/Reply Foto)"]
handler.command = ["umi-maker-hangingpolaroid", "umi-hangingpolaroid", "umi-polaroid2", "umi-pola", "umi-bingkai", "umi-frame", "hangingpolaroid", "polaroid2", "pola", "bingkai", "frame"]
handler.tags = ["maker"]
handler.description = "Membuat foto bingkai Polaroid gantung yang otomatis menyesuaikan ukuran foto asli (Responsive pure SVG)"
handler.importSource = "umi"
handler.importConfig = {"name": "hangingpolaroid", "alias": ["polaroid2", "pola", "bingkai", "frame"], "category": "maker", "description": "Membuat foto bingkai Polaroid gantung yang otomatis menyesuaikan ukuran foto asli (Responsive pure SVG)", "usage": ".pola (Kirim/Reply Foto)", "example": ".pola", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-hangingpolaroid": "hangingpolaroid", "umi-hangingpolaroid": "hangingpolaroid", "umi-polaroid2": "polaroid2", "umi-pola": "pola", "umi-bingkai": "bingkai", "umi-frame": "frame", "hangingpolaroid": "hangingpolaroid", "polaroid2": "polaroid2", "pola": "pola", "bingkai": "bingkai", "frame": "frame"}
export default handler
