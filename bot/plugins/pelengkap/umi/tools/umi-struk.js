import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "struk", "category": "tools", "aliasMap": {"umi-tools-struk": "struk", "umi-struk": "struk", "umi-printstruk": "printstruk", "umi-buatstruk": "buatstruk", "umi-pdfstruk": "pdfstruk", "struk": "struk", "printstruk": "printstruk", "buatstruk": "buatstruk", "pdfstruk": "pdfstruk"}, "description": "Membuat struk belanja simpel (Nama Store, No Telp, Produk, Jumlah, Harga, Tanggal)", "usage": ".struk <Nama Store> | <No Telp> | <Produk> | <Jumlah> | <Harga>", "example": ".struk Toko Berkah | 08123456789 | Kopi Susu | 2 | 5000", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/struk.js", metadata, m, extra)
handler.help = ["umi-tools-struk <Nama Store> | <No Telp> | <Produk> | <Jumlah> | <Harga>"]
handler.command = ["umi-tools-struk", "umi-struk", "umi-printstruk", "umi-buatstruk", "umi-pdfstruk", "struk", "printstruk", "buatstruk", "pdfstruk"]
handler.tags = ["tools"]
handler.description = "Membuat struk belanja simpel (Nama Store, No Telp, Produk, Jumlah, Harga, Tanggal)"
handler.importSource = "umi"
handler.importConfig = {"name": "struk", "alias": ["printstruk", "buatstruk", "pdfstruk"], "category": "tools", "description": "Membuat struk belanja simpel (Nama Store, No Telp, Produk, Jumlah, Harga, Tanggal)", "usage": ".struk <Nama Store> | <No Telp> | <Produk> | <Jumlah> | <Harga>", "example": ".struk Toko Berkah | 08123456789 | Kopi Susu | 2 | 5000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-struk": "struk", "umi-struk": "struk", "umi-printstruk": "printstruk", "umi-buatstruk": "buatstruk", "umi-pdfstruk": "pdfstruk", "struk": "struk", "printstruk": "printstruk", "buatstruk": "buatstruk", "pdfstruk": "pdfstruk"}
export default handler
