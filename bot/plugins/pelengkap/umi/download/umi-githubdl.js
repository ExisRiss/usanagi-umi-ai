/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "githubdl", "category": "download", "aliasMap": {"umi-download-githubdl": "githubdl", "umi-githubdl": "githubdl", "umi-gitdl": "gitdl", "umi-gitclone": "gitclone", "umi-repodownload": "repodownload", "githubdl": "githubdl", "gitdl": "gitdl", "gitclone": "gitclone", "repodownload": "repodownload"}, "description": "Download repository GitHub sebagai ZIP", "usage": ".githubdl <user> <repo> <branch>", "example": ".githubdl niceplugin NiceBot main", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/githubdl.js", metadata, m, extra)
handler.help = ["umi-download-githubdl <user> <repo> <branch>"]
handler.command = ["umi-download-githubdl", "umi-githubdl", "umi-gitdl", "umi-gitclone", "umi-repodownload", "githubdl", "gitdl", "gitclone", "repodownload"]
handler.tags = ["download"]
handler.description = "Download repository GitHub sebagai ZIP"
handler.importSource = "umi"
handler.importConfig = {"name": "githubdl", "alias": ["gitdl", "gitclone", "repodownload"], "category": "download", "description": "Download repository GitHub sebagai ZIP", "usage": ".githubdl <user> <repo> <branch>", "example": ".githubdl niceplugin NiceBot main", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-githubdl": "githubdl", "umi-githubdl": "githubdl", "umi-gitdl": "gitdl", "umi-gitclone": "gitclone", "umi-repodownload": "repodownload", "githubdl": "githubdl", "gitdl": "gitdl", "gitclone": "gitclone", "repodownload": "repodownload"}
export default handler
