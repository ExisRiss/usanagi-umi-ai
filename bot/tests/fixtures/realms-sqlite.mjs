import Database from 'better-sqlite3'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'umi-realms-test-'))
export const dbPath=path.join(directory,'test.sqlite')
const db=new Database(dbPath)
db.pragma('journal_mode = WAL')
export const getDb=()=>db
export function cleanup(){db.close();fs.rmSync(directory,{recursive:true,force:true})}
