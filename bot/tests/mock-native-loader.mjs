const snippets = {
 'fs':`import fs from 'node:fs';export default fs;export const watchFile=()=>{};export const unwatchFile=()=>{};`,
 './lib/simple.js': `export const smsg=(conn,m)=>m;`,
 '@rexxhayanasi/elaina-baileys': `export const generateWAMessageFromContent=()=>({});export const proto={};`,
 'chalk': `const color=new Proxy(x=>String(x),{get:(t,k)=>color});export default color;`,
 './lib/welcome.js': `export const createWelcomeCard=()=>{};`,
 './lib/awang-cekakses.js': `export const normalizeNumber=x=>String(x||'').replace(/\\D/g,'');export const getAllOwnerNumbers=()=>[];export const resolveTargetPhoneNumber=async x=>String(x).split('@')[0];`,
 './lib/user-identity.js': `export const collectUserIdentityKeys=m=>[m.sender];export const mergeUserIdentityRecords=(users,keys)=>users[keys[0]]||{};`,
 './core/awang-prefix.js': `export const getActivePrefix=async(_key,fallback)=>fallback||'/';`,
 './lib/bot-config.js': `export const prefixStorageKey=(conn,chat)=>conn.user.id+chat;export const isPluginDisabled=()=>false;`,
 './lib/awang-aksesgrub.js': `export const isGroupAdmin=async()=>false;export const isBotAdmin=async()=>false;`,
 './awang-aksesgrub.js': `export const isGroupAdmin=async()=>false;export const isBotAdmin=async()=>false;`,
 './lib/awang-tombol.js': `export const sendInteractive=()=>{};`,
 './lib/jadibot-group-welcome.js': `export const getSessionWelcomeTemplate=()=>'';export const getSessionGoodbyeTemplate=()=>'';`,
 './config/settings.js': `export default {};`,
 './lib/print.js': `export default async()=>{};`,
}
export async function resolve(specifier,context,next){if(specifier.startsWith('./lib/database.js'))return{url:'data:text/javascript,'+encodeURIComponent('export default async()=>{};'),shortCircuit:true};if(specifier in snippets)return{url:'data:text/javascript,'+encodeURIComponent(snippets[specifier]),shortCircuit:true};return next(specifier,context)}
