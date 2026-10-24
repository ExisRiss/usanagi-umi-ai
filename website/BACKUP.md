# Hourly private backup

The production backup service creates one **safe-operational** generation every hour. A generation has exactly three separate private archives:

- `website.tar.gz` — website source and static assets, excluding `.env*`, private keys, `.vercel`, `.git`, dependencies, and generated snapshots.
- `bot.tar.gz` — bot application source, plugins, package manifests, and safe text configuration files. It excludes `config.js`, `.env*`, tokens, credentials, main WhatsApp sessions, `data/`, and dependencies.
- `jadibot.tar.gz` — Jadibot platform metadata, each session's `bot-config.json`, and custom plugins. It never includes `creds.json`, any other WhatsApp auth/session credentials, or session media.

The archives are in a **private Vercel Blob** store. They cannot be read through a public Blob URL.

## Rotation behavior

1. The scheduler calls `POST /api/cron/backup` with `Authorization: Bearer $BACKUP_CRON_SECRET`.
2. Vercel asks the bot, through the existing HTTPS Cloudflare endpoint, to generate the bot and Jadibot archives.
3. Vercel uploads all three archives under a new generation.
4. It writes the private `current.json` manifest only after all three uploads succeed.
5. It then deletes every older generation.

A failure before step 4 deletes only the partial new generation. The prior three archive files remain intact.

## Hourly trigger scheduler

Vercel Hobby Cron supports only one run per day, so the project uses the always-running Pterodactyl bot container as the external hourly trigger. Its scheduler calls the HTTPS Vercel endpoint at the next top-of-hour, then once every hour:

```bash
curl --fail --silent --show-error --request POST \
  --header "Authorization: Bearer $BACKUP_CRON_SECRET" \
  https://website-jadibot-by-alzriss.vercel.app/api/cron/backup
```

`BACKUP_CRON_SECRET` exists only in the remote Pterodactyl secret file and Vercel environment. It is never placed in a repository, Gist, browser code, or chat message. If a different scheduler is used later, it must make the same authenticated HTTPS request once per hour.

## Required private environment variables

Vercel production/preview/development:

- `BACKUP_CRON_SECRET` — validates the external scheduler.
- `BOT_BACKUP_EXPORT_SECRET` — authenticates Vercel to the bot's internal, HTTPS-only export route.
- `BLOB_READ_WRITE_TOKEN` — added automatically by the private Vercel Blob connection; never expose it.

Pterodactyl only:

- `/home/container/.backup-export.env` with `UMI_BACKUP_EXPORT_SECRET`, equal to `BOT_BACKUP_EXPORT_SECRET`.

The bot startup script sources this file locally. It is not committed or stored in the Gist.

## Restore notes

A safe-operational backup restores source and Jadibot settings/plugins, but intentionally cannot restore WhatsApp authentication sessions, tokens, or secret environment variables. Reconnect WhatsApp and provide secrets through their approved secret managers after a recovery.
