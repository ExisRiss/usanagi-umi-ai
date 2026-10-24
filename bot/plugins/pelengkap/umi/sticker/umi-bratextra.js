/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bratextra", "category": "sticker", "aliasMap": {"umi-sticker-bratextra": "bratextra", "umi-bratextra": "bratextra", "umi-bratanime": "bratanime", "umi-bratbahlil": "bratbahlil", "umi-brathd": "brathd", "umi-bratpatrick": "bratpatrick", "umi-bratsquidward": "bratsquidward", "umi-bratwhite": "bratwhite", "umi-bratchika": "bratchika", "umi-bratkobato": "bratkobato", "umi-bratmenhera": "bratmenhera", "umi-bratnezuko": "bratnezuko", "umi-bratqiqi": "bratqiqi", "umi-bratruromiya": "bratruromiya", "umi-bratumaru": "bratumaru", "bratextra": "bratextra", "bratanime": "bratanime", "brathd": "brathd", "bratpatrick": "bratpatrick", "bratsquidward": "bratsquidward", "bratwhite": "bratwhite", "bratchika": "bratchika", "bratkobato": "bratkobato", "bratmenhera": "bratmenhera", "bratnezuko": "bratnezuko", "bratqiqi": "bratqiqi", "bratruromiya": "bratruromiya", "bratumaru": "bratumaru"}, "description": "Bikin brat versi custom", "usage": ".bratanime <teks>", "example": ".bratanime Halo", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/bratextra.js", metadata, m, extra)
handler.help = ["umi-sticker-bratextra <teks>"]
handler.command = ["umi-sticker-bratextra", "umi-bratextra", "umi-bratanime", "umi-bratbahlil", "umi-brathd", "umi-bratpatrick", "umi-bratsquidward", "umi-bratwhite", "umi-bratchika", "umi-bratkobato", "umi-bratmenhera", "umi-bratnezuko", "umi-bratqiqi", "umi-bratruromiya", "umi-bratumaru", "bratextra", "bratanime", "brathd", "bratpatrick", "bratsquidward", "bratwhite", "bratchika", "bratkobato", "bratmenhera", "bratnezuko", "bratqiqi", "bratruromiya", "bratumaru"]
handler.tags = ["sticker"]
handler.description = "Bikin brat versi custom"
handler.importSource = "umi"
handler.importConfig = {"name": "bratextra", "alias": ["bratanime", "bratbahlil", "brathd", "bratpatrick", "bratsquidward", "bratwhite", "bratchika", "bratkobato", "bratmenhera", "bratnezuko", "bratqiqi", "bratruromiya", "bratumaru"], "category": "sticker", "description": "Bikin brat versi custom", "usage": ".bratanime <teks>", "example": ".bratanime Halo", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-bratextra": "bratextra", "umi-bratextra": "bratextra", "umi-bratanime": "bratanime", "umi-bratbahlil": "bratbahlil", "umi-brathd": "brathd", "umi-bratpatrick": "bratpatrick", "umi-bratsquidward": "bratsquidward", "umi-bratwhite": "bratwhite", "umi-bratchika": "bratchika", "umi-bratkobato": "bratkobato", "umi-bratmenhera": "bratmenhera", "umi-bratnezuko": "bratnezuko", "umi-bratqiqi": "bratqiqi", "umi-bratruromiya": "bratruromiya", "umi-bratumaru": "bratumaru", "bratextra": "bratextra", "bratanime": "bratanime", "brathd": "brathd", "bratpatrick": "bratpatrick", "bratsquidward": "bratsquidward", "bratwhite": "bratwhite", "bratchika": "bratchika", "bratkobato": "bratkobato", "bratmenhera": "bratmenhera", "bratnezuko": "bratnezuko", "bratqiqi": "bratqiqi", "bratruromiya": "bratruromiya", "bratumaru": "bratumaru"}
export default handler
