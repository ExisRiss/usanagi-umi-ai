import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "logo-glow", "category": "maker", "aliasMap": {"umi-maker-logo-glow": "logo-glow", "umi-logo-glow": "logo-glow", "umi-logoglow": "logoglow", "umi-neonlogo": "neonlogo", "umi-glowlogo": "glowlogo", "logo-glow": "logo-glow", "logoglow": "logoglow", "neonlogo": "neonlogo", "glowlogo": "glowlogo"}, "description": "Buat logo dengan efek neon glow", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/logoglow.js", metadata, m, extra)
handler.help = ["umi-maker-logo-glow"]
handler.command = ["umi-maker-logo-glow", "umi-logo-glow", "umi-logoglow", "umi-neonlogo", "umi-glowlogo", "logo-glow", "logoglow", "neonlogo", "glowlogo"]
handler.tags = ["maker"]
handler.description = "Buat logo dengan efek neon glow"
handler.importSource = "umi"
handler.importConfig = {"name": "logo-glow", "alias": ["logoglow", "neonlogo", "glowlogo"], "category": "maker", "description": "Buat logo dengan efek neon glow", "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-logo-glow": "logo-glow", "umi-logo-glow": "logo-glow", "umi-logoglow": "logoglow", "umi-neonlogo": "neonlogo", "umi-glowlogo": "glowlogo", "logo-glow": "logo-glow", "logoglow": "logoglow", "neonlogo": "neonlogo", "glowlogo": "glowlogo"}
export default handler
