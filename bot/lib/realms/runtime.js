import fs from 'node:fs'
import path from 'node:path'
import { getDb } from '../../core/awang-sqlite.js'
import { getUser,saveUser } from '../rpg/awang-db.js'
import { createRealmService } from './service.js'
let service
export function realmService(){
 if(!service){
  const db=getDb()
  // Consistent SQLite snapshot, including WAL, before first additive migration.
  if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='realm_accounts'").get()){
   const backup=path.join(path.dirname(db.name),'pre-realms-v1.sqlite')
   if(!fs.existsSync(backup)){db.prepare('VACUUM INTO ?').run(backup);fs.chmodSync(backup,0o600)}
  }
  service=createRealmService({db,getUser,saveUser})
 }
 return service
}
