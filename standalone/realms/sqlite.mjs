// Preview-only DB. Loader redirects the legacy RPG adapter here in this process.
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
if(process.env.REALMS_MODE!=='preview')throw Error('Standalone server requires REALMS_MODE=preview. Production uses the bot runtime.')
const dir=path.resolve(process.env.REALMS_DATA_DIR||'./data')
fs.mkdirSync(dir,{recursive:true,mode:0o700})
const db=new Database(path.join(dir,'realms-preview.sqlite'))
db.pragma('journal_mode = WAL');db.pragma('busy_timeout = 5000')
fs.chmodSync(db.name,0o600)
export const getDb=()=>db
