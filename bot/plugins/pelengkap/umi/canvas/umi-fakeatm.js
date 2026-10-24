import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeatm", "category": "canvas", "aliasMap": {"umi-canvas-fakeatm": "fakeatm", "umi-fakeatm": "fakeatm", "umi-atmfake": "atmfake", "umi-kartuatm": "kartuatm", "umi-fakecardatm": "fakecardatm", "fakeatm": "fakeatm", "atmfake": "atmfake", "kartuatm": "kartuatm", "fakecardatm": "fakecardatm"}, "description": "Bikin fake kartu ATM (buat konten/gaguan doang)", "usage": ".fakeatm <nama> | <bank>", "example": ".fakeatm Umi | BCA", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeatm.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeatm <nama> | <bank>"]
handler.command = ["umi-canvas-fakeatm", "umi-fakeatm", "umi-atmfake", "umi-kartuatm", "umi-fakecardatm", "fakeatm", "atmfake", "kartuatm", "fakecardatm"]
handler.tags = ["canvas"]
handler.description = "Bikin fake kartu ATM (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeatm", "alias": ["atmfake", "kartuatm", "fakecardatm"], "category": "canvas", "description": "Bikin fake kartu ATM (buat konten/gaguan doang)", "usage": ".fakeatm <nama> | <bank>", "example": ".fakeatm Umi | BCA", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeatm": "fakeatm", "umi-fakeatm": "fakeatm", "umi-atmfake": "atmfake", "umi-kartuatm": "kartuatm", "umi-fakecardatm": "fakecardatm", "fakeatm": "fakeatm", "atmfake": "atmfake", "kartuatm": "kartuatm", "fakecardatm": "fakecardatm"}
export default handler
