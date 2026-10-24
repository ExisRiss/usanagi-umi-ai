import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "logo-gold", "category": "maker", "aliasMap": {"umi-maker-logo-gold": "logo-gold", "umi-logo-gold": "logo-gold", "umi-logogold": "logogold", "umi-goldlogo": "goldlogo", "umi-goldtext": "goldtext", "umi-emastulisan": "emastulisan", "logo-gold": "logo-gold", "logogold": "logogold", "goldlogo": "goldlogo", "goldtext": "goldtext", "emastulisan": "emastulisan"}, "description": "Buat logo dengan efek emas mewah (gold premium)", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/logogold.js", metadata, m, extra)
handler.help = ["umi-maker-logo-gold"]
handler.command = ["umi-maker-logo-gold", "umi-logo-gold", "umi-logogold", "umi-goldlogo", "umi-goldtext", "umi-emastulisan", "logo-gold", "logogold", "goldlogo", "goldtext", "emastulisan"]
handler.tags = ["maker"]
handler.description = "Buat logo dengan efek emas mewah (gold premium)"
handler.importSource = "umi"
handler.importConfig = {"name": "logo-gold", "alias": ["logogold", "goldlogo", "goldtext", "emastulisan"], "category": "maker", "description": "Buat logo dengan efek emas mewah (gold premium)", "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-logo-gold": "logo-gold", "umi-logo-gold": "logo-gold", "umi-logogold": "logogold", "umi-goldlogo": "goldlogo", "umi-goldtext": "goldtext", "umi-emastulisan": "emastulisan", "logo-gold": "logo-gold", "logogold": "logogold", "goldlogo": "goldlogo", "goldtext": "goldtext", "emastulisan": "emastulisan"}
export default handler
