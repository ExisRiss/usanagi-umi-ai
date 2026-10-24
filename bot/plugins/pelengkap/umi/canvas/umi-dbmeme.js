import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dbmeme", "category": "canvas", "aliasMap": {"umi-canvas-dbmeme": "dbmeme", "umi-dbmeme": "dbmeme", "umi-distractedboy": "distractedboy", "umi-dbm": "dbm", "umi-memedb": "memedb", "dbmeme": "dbmeme", "distractedboy": "distractedboy", "dbm": "dbm", "memedb": "memedb"}, "description": "Membuat meme 'Distracted Boyfriend' dengan 3 teks custom", "usage": ".dbmeme <text1> | <text2> | <text3>", "example": ".dbmeme Ah tu cewe cakep | Hei kamu ngeliatin kemana | tu cowo ngeliatin gw", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/dbmeme.js", metadata, m, extra)
handler.help = ["umi-canvas-dbmeme <text1> | <text2> | <text3>"]
handler.command = ["umi-canvas-dbmeme", "umi-dbmeme", "umi-distractedboy", "umi-dbm", "umi-memedb", "dbmeme", "distractedboy", "dbm", "memedb"]
handler.tags = ["canvas"]
handler.description = "Membuat meme 'Distracted Boyfriend' dengan 3 teks custom"
handler.importSource = "umi"
handler.importConfig = {"name": "dbmeme", "alias": ["distractedboy", "dbm", "memedb"], "category": "canvas", "description": "Membuat meme 'Distracted Boyfriend' dengan 3 teks custom", "usage": ".dbmeme <text1> | <text2> | <text3>", "example": ".dbmeme Ah tu cewe cakep | Hei kamu ngeliatin kemana | tu cowo ngeliatin gw", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-canvas-dbmeme": "dbmeme", "umi-dbmeme": "dbmeme", "umi-distractedboy": "distractedboy", "umi-dbm": "dbm", "umi-memedb": "memedb", "dbmeme": "dbmeme", "distractedboy": "distractedboy", "dbm": "dbm", "memedb": "memedb"}
export default handler
