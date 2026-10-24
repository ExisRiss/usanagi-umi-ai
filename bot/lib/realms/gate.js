// Shared across website actions and native RPG plugins, including awaits for media.
import { AsyncLocalStorage } from 'node:async_hooks'
import { withRpgLocks } from '../rpg/awang-lock.js'
const key=Symbol.for('umi.realms.gate.v1')
if(!global[key])global[key]={context:new AsyncLocalStorage(),queued:0}
const gate=global[key]
export async function withRealmGate(task){
 if(gate.context.getStore()?.active)return task()
 if(gate.queued>=128)throw Object.assign(new Error('Dunia sedang sibuk. Coba sebentar lagi.'),{status:503})
 gate.queued++
 try{return await withRpgLocks(['rpg:shared-world'],()=>{const scope={active:true};return gate.context.run(scope,async()=>{try{return await task()}finally{scope.active=false}})})}
 finally{gate.queued--}
}
