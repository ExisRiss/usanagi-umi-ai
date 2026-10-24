import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "spotifydl", "category": "download", "aliasMap": {"umi-download-spotifydl": "spotifydl", "umi-spotifydl": "spotifydl", "umi-spdl": "spdl", "umi-spotify-dl": "spotify-dl", "umi-spotdl": "spotdl", "spotifydl": "spotifydl", "spotify-dl": "spotify-dl"}, "description": "Unduh lagu favoritmu langsung dari Spotify tanpa ribet!", "usage": ".spdl <link>", "example": ".spdl https://open.spotify.com/track/...", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/spotifydl.js", metadata, m, extra)
handler.help = ["umi-download-spotifydl <link>"]
handler.command = ["umi-download-spotifydl", "umi-spotifydl", "umi-spdl", "umi-spotify-dl", "umi-spotdl", "spotifydl", "spotify-dl"]
handler.tags = ["download"]
handler.description = "Unduh lagu favoritmu langsung dari Spotify tanpa ribet!"
handler.importSource = "umi"
handler.importConfig = {"name": "spotifydl", "alias": ["spdl", "spotify-dl", "spotdl"], "category": "download", "description": "Unduh lagu favoritmu langsung dari Spotify tanpa ribet!", "usage": ".spdl <link>", "example": ".spdl https://open.spotify.com/track/...", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-spotifydl": "spotifydl", "umi-spotifydl": "spotifydl", "umi-spdl": "spdl", "umi-spotify-dl": "spotify-dl", "umi-spotdl": "spotdl", "spotifydl": "spotifydl", "spotify-dl": "spotify-dl"}
export default handler
