import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
const oldCwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'umi-settings-test-'));process.chdir(temp)
const {startUmiAgentWorker,updateAgentSettings,agentStatus}=await import('../lib/umi-agent.js')
const {resetGroqConfigCache}=await import('../lib/groq-client.js')
startUmiAgentWorker(()=> 'unit-relay-secret-with-at-least-32-characters')
const key='gsk_'+'x'.repeat(40),openrouter='sk-or-v1-'+'y'.repeat(40)
test('Groq settings encrypted at rest and status never contains the key',()=>{const status=updateAgentSettings({provider:'groq',apiKey:key,model:'openai/gpt-oss-120b'},'fixture-owner');assert(status.configured);assert.equal(status.provider,'groq');assert(!JSON.stringify(status).includes(key));assert(!fs.readFileSync(path.join(temp,'data/umi-agent/settings.enc.json'),'utf8').includes(key));assert.equal(fs.statSync(path.join(temp,'.env.groq')).mode&0o777,0o600)})
test('blank Groq key preserves existing key',()=>{const status=updateAgentSettings({provider:'groq',apiKey:'',model:'openai/gpt-oss-20b'},'fixture-owner');assert(status.configured);assert.equal(status.model,'openai/gpt-oss-20b')})
test('invalid key cannot replace working settings',()=>{const before=fs.readFileSync(path.join(temp,'data/umi-agent/settings.enc.json'),'utf8');assert.throws(()=>updateAgentSettings({provider:'groq',apiKey:'gsk_bad-\ninjected-setting',model:'openai/gpt-oss-120b'},'fixture-owner'),/Format key/);assert.equal(fs.readFileSync(path.join(temp,'data/umi-agent/settings.enc.json'),'utf8'),before)})
test('switching providers preserves their separately encrypted keys',()=>{updateAgentSettings({provider:'openrouter',apiKey:openrouter,model:'openrouter/auto'},'fixture-owner');assert.equal(agentStatus().provider,'openrouter');updateAgentSettings({provider:'groq',apiKey:'',model:''},'fixture-owner');assert.equal(agentStatus().provider,'groq');updateAgentSettings({provider:'openrouter',apiKey:'',model:''},'fixture-owner');assert(agentStatus().configured);assert.equal(agentStatus().model,'openrouter/auto')})
test.after(()=>{process.chdir(oldCwd);fs.rmSync(temp,{recursive:true,force:true});resetGroqConfigCache()})
