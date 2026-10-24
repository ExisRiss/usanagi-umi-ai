import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addscraper", "category": "owner", "aliasMap": {"umi-owner-addscraper": "addscraper", "umi-addscraper": "addscraper", "umi-newscraper": "newscraper", "umi-createscraper": "createscraper", "umi-tambahscraper": "tambahscraper", "addscraper": "addscraper", "newscraper": "newscraper", "createscraper": "createscraper", "tambahscraper": "tambahscraper"}, "description": "Menambahkan scraper baru ke src/scraper/ (Owner only)", "usage": ".addscraper <nama>", "example": ".addscraper konchan\n\nReply pesan yang berisi kode scraper", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addscraper.js", metadata, m, extra)
handler.help = ["umi-owner-addscraper <nama>"]
handler.command = ["umi-owner-addscraper", "umi-addscraper", "umi-newscraper", "umi-createscraper", "umi-tambahscraper", "addscraper", "newscraper", "createscraper", "tambahscraper"]
handler.tags = ["owner"]
handler.description = "Menambahkan scraper baru ke src/scraper/ (Owner only)"
handler.importSource = "umi"
handler.importConfig = {"name": "addscraper", "alias": ["addscraper", "newscraper", "createscraper", "tambahscraper"], "category": "owner", "description": "Menambahkan scraper baru ke src/scraper/ (Owner only)", "usage": ".addscraper <nama>", "example": ".addscraper konchan\n\nReply pesan yang berisi kode scraper", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addscraper": "addscraper", "umi-addscraper": "addscraper", "umi-newscraper": "newscraper", "umi-createscraper": "createscraper", "umi-tambahscraper": "tambahscraper", "addscraper": "addscraper", "newscraper": "newscraper", "createscraper": "createscraper", "tambahscraper": "tambahscraper"}
export default handler
