import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import {getDb,dbPath,cleanup} from './fixtures/realms-sqlite.mjs'
import {getUser,saveUser} from '../lib/rpg/awang-db.js'
import {realmService} from '../lib/realms/runtime.js'
test('first migration backs up WAL-consistent SQLite and preserves every legacy player byte',()=>{
 const db=getDb(),jid='6280000000099',u=getUser(jid);u.koin=12345;u.inventory.iron=9;saveUser(jid,u)
 const before=db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(jid).data
 assert(!db.prepare("SELECT name FROM sqlite_master WHERE name='realm_accounts'").get())
 const service=realmService(),backup=path.join(path.dirname(dbPath),'pre-realms-v1.sqlite')
 assert.equal(fs.statSync(backup).mode&0o777,0o600)
 const snapshot=new Database(backup,{readonly:true});assert.equal(snapshot.prepare('SELECT data FROM rpg_users WHERE jid=?').get(jid).data,before);assert(!snapshot.prepare("SELECT name FROM sqlite_master WHERE name='realm_accounts'").get());snapshot.close()
 assert.equal(db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(jid).data,before)
 assert(db.prepare("SELECT name FROM sqlite_master WHERE name='realm_accounts'").get())
 assert.equal(realmService(),service)
})
test.after(cleanup)
