import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "countrystalk", "category": "stalker  ", "aliasMap": {"umi-stalker---countrystalk": "countrystalk", "umi-countrystalk": "countrystalk", "umi-stalknegara": "stalknegara", "umi-infonegara": "infonegara", "countrystalk": "countrystalk", "stalknegara": "stalknegara", "infonegara": "infonegara"}, "description": "Mencari informasi detail tentang suatu negara", "usage": ".country <nama negara>", "example": ".country indonesia", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/countrystalk.js", metadata, m, extra)
handler.help = ["umi-stalker---countrystalk <nama negara>"]
handler.command = ["umi-stalker---countrystalk", "umi-countrystalk", "umi-stalknegara", "umi-infonegara", "countrystalk", "stalknegara", "infonegara"]
handler.tags = ["stalker  "]
handler.description = "Mencari informasi detail tentang suatu negara"
handler.importSource = "umi"
handler.importConfig = {"name": "countrystalk", "alias": ["stalknegara", "infonegara"], "category": "stalker  ", "description": "Mencari informasi detail tentang suatu negara", "usage": ".country <nama negara>", "example": ".country indonesia", "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker---countrystalk": "countrystalk", "umi-countrystalk": "countrystalk", "umi-stalknegara": "stalknegara", "umi-infonegara": "infonegara", "countrystalk": "countrystalk", "stalknegara": "stalknegara", "infonegara": "infonegara"}
export default handler
