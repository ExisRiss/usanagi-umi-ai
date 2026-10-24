// Isolated QA server. Never deploy this file or its test identities to production.
import http from 'node:http'
import fs from 'node:fs'
import {getDb} from './fixtures/realms-sqlite.mjs'
import {getUser,saveUser} from '../lib/rpg/awang-db.js'
import {createRealmService} from '../lib/realms/service.js'
import {createRealmHttp} from '../lib/realms/http.js'
const service=createRealmService({db:getDb(),getUser,saveUser})
const codes=[]
for(let i=1;i<=3;i++){
 const jid='628000000999'+i,u=getUser(jid);u.koin=4000;u.exp=0;u.level=1;saveUser(jid,u)
 codes.push(service.issueCode(jid).code)
}
fs.writeFileSync('/home/user/.secrets/task46-test-login.json',JSON.stringify(codes),{mode:0o600})
const handler=createRealmHttp(()=>service)
http.createServer((req,res)=>{if(req.url==='/'){res.writeHead(302,{Location:'/realms'});res.end();return}return handler(req,res)}).listen(4173,'0.0.0.0',()=>console.log('Isolated Realms QA server on port 4173; credentials saved privately.'))
