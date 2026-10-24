import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakesertifikat", "category": "canvas", "aliasMap": {"umi-canvas-fakesertifikat": "fakesertifikat", "umi-fakesertifikat": "fakesertifikat", "umi-sertifikatfake": "sertifikatfake", "umi-fakecert": "fakecert", "fakesertifikat": "fakesertifikat", "sertifikatfake": "sertifikatfake", "fakecert": "fakecert"}, "description": "Bikin fake sertifikat penghargaan (buat konten/gaguan doang)", "usage": ".fakesertifikat <nama> | <penghargaan>", "example": ".fakesertifikat Umi | Best Darling Award", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakesertifikat.js", metadata, m, extra)
handler.help = ["umi-canvas-fakesertifikat <nama> | <penghargaan>"]
handler.command = ["umi-canvas-fakesertifikat", "umi-fakesertifikat", "umi-sertifikatfake", "umi-fakecert", "fakesertifikat", "sertifikatfake", "fakecert"]
handler.tags = ["canvas"]
handler.description = "Bikin fake sertifikat penghargaan (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakesertifikat", "alias": ["sertifikatfake", "fakecert"], "category": "canvas", "description": "Bikin fake sertifikat penghargaan (buat konten/gaguan doang)", "usage": ".fakesertifikat <nama> | <penghargaan>", "example": ".fakesertifikat Umi | Best Darling Award", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakesertifikat": "fakesertifikat", "umi-fakesertifikat": "fakesertifikat", "umi-sertifikatfake": "sertifikatfake", "umi-fakecert": "fakecert", "fakesertifikat": "fakesertifikat", "sertifikatfake": "sertifikatfake", "fakecert": "fakecert"}
export default handler
