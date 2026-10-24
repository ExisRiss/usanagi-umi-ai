import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "encrypt", "category": "tools", "aliasMap": {"umi-tools-encrypt": "encrypt", "umi-encrypt": "encrypt", "umi-enc": "enc", "umi-obfuscate": "obfuscate", "umi-enccode": "enccode", "obfuscate": "obfuscate", "enccode": "enccode"}, "description": "Enkripsi / Obfuscate kode JavaScript", "usage": ".encrypt (reply file/code)", "example": ".encrypt", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/enc.js", metadata, m, extra)
handler.help = ["umi-tools-encrypt (reply file/code)"]
handler.command = ["umi-tools-encrypt", "umi-encrypt", "umi-enc", "umi-obfuscate", "umi-enccode", "obfuscate", "enccode"]
handler.tags = ["tools"]
handler.description = "Enkripsi / Obfuscate kode JavaScript"
handler.importSource = "umi"
handler.importConfig = {"name": "encrypt", "alias": ["enc", "obfuscate", "enccode"], "category": "tools", "description": "Enkripsi / Obfuscate kode JavaScript", "usage": ".encrypt (reply file/code)", "example": ".encrypt", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-encrypt": "encrypt", "umi-encrypt": "encrypt", "umi-enc": "enc", "umi-obfuscate": "obfuscate", "umi-enccode": "enccode", "obfuscate": "obfuscate", "enccode": "enccode"}
export default handler
