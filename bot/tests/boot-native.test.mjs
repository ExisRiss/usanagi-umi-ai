import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
const source=fs.readFileSync(new URL('../scripts/boot.js',import.meta.url),'utf8')
const fn=source.slice(source.indexOf('function canLoad('),source.indexOf('\nfunction run('))
test('SQLite native probe detects lazy missing binding even when require succeeds',()=>{
 const require=()=>function(){throw Error('Could not locate native bindings')}
 assert.equal(vm.runInNewContext(fn+';canLoad("better-sqlite3")',{require}),false)
})
test('SQLite native probe performs a real query and closes its memory database',()=>{
 let queried=false,closed=false
 const require=()=>function(){this.prepare=()=>({get:()=>{queried=true;return{ok:1}}});this.close=()=>closed=true}
 assert.equal(vm.runInNewContext(fn+';canLoad("better-sqlite3")',{require}),true)
 assert(queried&&closed)
})
