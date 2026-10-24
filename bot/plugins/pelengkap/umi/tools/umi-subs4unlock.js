import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "subs4unlock", "category": "tools", "aliasMap": {"umi-tools-subs4unlock": "subs4unlock", "umi-subs4unlock": "subs4unlock", "umi-sub4unlock": "sub4unlock", "umi-bypasssub": "bypasssub", "umi-unlocksub": "unlocksub", "subs4unlock": "subs4unlock", "sub4unlock": "sub4unlock", "bypasssub": "bypasssub", "unlocksub": "unlocksub"}, "description": "Melakukan bypass link subs4unlock secara otomatis", "usage": ".subs4unlock <link>", "example": ".subs4unlock https://subs4unlock.id/VjeQWY", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/subs4unlock.js", metadata, m, extra)
handler.help = ["umi-tools-subs4unlock <link>"]
handler.command = ["umi-tools-subs4unlock", "umi-subs4unlock", "umi-sub4unlock", "umi-bypasssub", "umi-unlocksub", "subs4unlock", "sub4unlock", "bypasssub", "unlocksub"]
handler.tags = ["tools"]
handler.description = "Melakukan bypass link subs4unlock secara otomatis"
handler.importSource = "umi"
handler.importConfig = {"name": "subs4unlock", "alias": ["sub4unlock", "bypasssub", "unlocksub"], "category": "tools", "description": "Melakukan bypass link subs4unlock secara otomatis", "usage": ".subs4unlock <link>", "example": ".subs4unlock https://subs4unlock.id/VjeQWY", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-subs4unlock": "subs4unlock", "umi-subs4unlock": "subs4unlock", "umi-sub4unlock": "sub4unlock", "umi-bypasssub": "bypasssub", "umi-unlocksub": "unlocksub", "subs4unlock": "subs4unlock", "sub4unlock": "sub4unlock", "bypasssub": "bypasssub", "unlocksub": "unlocksub"}
export default handler
