import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeijazah", "category": "canvas", "aliasMap": {"umi-canvas-fakeijazah": "fakeijazah", "umi-fakeijazah": "fakeijazah", "umi-ijazahfake": "ijazahfake", "umi-fakediploma": "fakediploma", "fakeijazah": "fakeijazah", "ijazahfake": "ijazahfake", "fakediploma": "fakediploma"}, "description": "Bikin fake ijazah (buat konten/gaguan doang)", "usage": ".fakeijazah <nama> | <gelar> | <universitas>", "example": ".fakeijazah Umi | S.Kom | Universitas Zero", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeijazah.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeijazah <nama> | <gelar> | <universitas>"]
handler.command = ["umi-canvas-fakeijazah", "umi-fakeijazah", "umi-ijazahfake", "umi-fakediploma", "fakeijazah", "ijazahfake", "fakediploma"]
handler.tags = ["canvas"]
handler.description = "Bikin fake ijazah (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeijazah", "alias": ["ijazahfake", "fakediploma"], "category": "canvas", "description": "Bikin fake ijazah (buat konten/gaguan doang)", "usage": ".fakeijazah <nama> | <gelar> | <universitas>", "example": ".fakeijazah Umi | S.Kom | Universitas Zero", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeijazah": "fakeijazah", "umi-fakeijazah": "fakeijazah", "umi-ijazahfake": "ijazahfake", "umi-fakediploma": "fakediploma", "fakeijazah": "fakeijazah", "ijazahfake": "ijazahfake", "fakediploma": "fakediploma"}
export default handler
