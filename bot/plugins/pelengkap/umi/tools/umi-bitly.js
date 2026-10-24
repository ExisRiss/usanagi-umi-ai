import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bitly", "category": "tools", "aliasMap": {"umi-tools-bitly": "bitly", "umi-bitly": "bitly", "umi-shortlink": "shortlink", "umi-shorturl": "shorturl", "bitly": "bitly", "shortlink": "shortlink", "shorturl": "shorturl"}, "description": "Shorten URL dengan Bitly", "usage": ".bitly <url>", "example": ".bitly https://google.com", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/bitly.js", metadata, m, extra)
handler.help = ["umi-tools-bitly <url>"]
handler.command = ["umi-tools-bitly", "umi-bitly", "umi-shortlink", "umi-shorturl", "bitly", "shortlink", "shorturl"]
handler.tags = ["tools"]
handler.description = "Shorten URL dengan Bitly"
handler.importSource = "umi"
handler.importConfig = {"name": "bitly", "alias": ["shortlink", "shorturl"], "category": "tools", "description": "Shorten URL dengan Bitly", "usage": ".bitly <url>", "example": ".bitly https://google.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-bitly": "bitly", "umi-bitly": "bitly", "umi-shortlink": "shortlink", "umi-shorturl": "shorturl", "bitly": "bitly", "shortlink": "shortlink", "shorturl": "shorturl"}
export default handler
