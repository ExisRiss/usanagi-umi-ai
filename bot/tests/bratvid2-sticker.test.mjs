import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import vm from 'node:vm'
import { spawn, spawnSync } from 'node:child_process'
import { fileTypeFromBuffer } from 'file-type'
import { writeExif } from '../lib/exif.js'
import webp from 'node-webpmux'

// Real plugin body and real ffmpeg/WebP conversion; only HTTP and WA transport stubbed.
// Run with FFMPEG_PATH set if ffmpeg is not on PATH.
const ffmpeg=process.env.FFMPEG_PATH || 'ffmpeg'
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'umi-brat-sticker-test-'))
after(()=>fs.remove(dir))
for(const [ext,args] of [
  ['mp4',['-f','lavfi','-i','testsrc=size=128x128:rate=10:duration=1','-pix_fmt','yuv420p']],
  ['gif',['-f','lavfi','-i','testsrc=size=128x128:rate=10:duration=1']],
  ['png',['-f','lavfi','-i','color=c=white:s=128x128','-frames:v','1']],
]) {
  const r=spawnSync(ffmpeg,['-loglevel','error','-y',...args,path.join(dir,'input.'+ext)])
  assert.equal(r.status,0,String(r.stderr||r.error))
}
const data=ext=>fs.readFileSync(path.join(dir,'input.'+ext))
const source=fs.readFileSync(new URL('../plugins/maker/brat2.js',import.meta.url),'utf8')
  .replace(/^import .+$/gm,'').replace('export default handler','global.handler = handler')
function setup({get,exif=writeExif,fallback=false,sendFail=false}={}) {
  const messages=[],replies=[],urls=[]
  const sandbox={Buffer,fs,os,path,crypto,spawn,fileTypeFromBuffer,writeExif:exif,getFfmpegBinPath:async()=>ffmpeg,
    setTimeout,clearTimeout,console:{log(){},warn(){},error(){}},global:{rinAPI:fallback?{bratvid2FallbackUrl:'https://fallback.invalid/brat'}:{}},
    axios:{get:async(url,options)=>{urls.push([url,options.params.text]);return get?get(url,options):{status:200,headers:{'content-type':'video/mp4'},data:data('mp4')}}}}
  vm.runInNewContext(source,sandbox)
  const m={chat:'fixture@g.us',react:async()=>{},reply:async s=>replies.push(s)}
  const conn={sendMessage:async(chat,payload,options)=>{messages.push({chat,payload,options});if(sendFail)throw Error('transport gagal')}}
  const run=(text='ayam',prefix='!')=>sandbox.global.handler(m,{conn,text,usedPrefix:prefix,command:'bratvid2'})
  return {run,m,messages,replies,urls}
}
async function verifySticker(result,animated) {
  assert(result.payload.sticker instanceof Buffer)
  for(const field of ['video','image','document','caption','gifPlayback','fileName']) assert(!(field in result.payload),field)
  const img=new webp.Image();await img.load(result.payload.sticker)
  assert.equal(img.hasAnim,animated)
  if(animated){assert(img.frames.length>1);assert.equal(result.payload.isAnimated,true)}
  assert(img.exif)
  assert.equal(img.width,320);assert.equal(img.height,320)
}
test('primary MP4 becomes animated sticker, never video',async()=>{const x=setup();assert.equal((await x.run()).success,true);assert.equal(x.messages.length,1);await verifySticker(x.messages[0],true);assert.equal(x.messages[0].options.quoted,x.m);assert.equal(x.urls[0][0],'https://apiii-xrina.my.id/maker/bratvid2');assert.equal(x.urls[0][1],'ayam')})
test('octet-stream sniffing still produces animated WebP',async()=>{const x=setup({get:async()=>({status:200,headers:{'content-type':'application/octet-stream'},data:data('mp4')})});assert.equal((await x.run()).success,true);await verifySticker(x.messages[0],true)})
test('image response is a sticker, not a photo',async()=>{const x=setup({get:async()=>({status:200,headers:{'content-type':'image/png'},data:data('png')})});assert.equal((await x.run()).success,true);await verifySticker(x.messages[0],false)})
test('GIF response keeps animation',async()=>{const x=setup({get:async()=>({status:200,headers:{'content-type':'image/gif'},data:data('gif')})});assert.equal((await x.run()).success,true);await verifySticker(x.messages[0],true)})
test('configured fallback GIF also sends sticker only',async()=>{const x=setup({fallback:true,get:async(url)=>url.includes('fallback.invalid')?{status:200,headers:{'content-type':'image/gif'},data:data('gif')}:{status:503,headers:{'content-type':'application/json'},data:Buffer.from('{"message":"sibuk"}')}});assert.equal((await x.run()).success,true);assert.equal(x.urls.length,3);await verifySticker(x.messages[0],true)})
test('invalid WebP conversion fails without sending MP4',async()=>{const x=setup({exif:async()=>data('mp4')});assert.equal((await x.run()).success,false);assert.equal(x.messages.length,0);assert.match(x.replies[0],/stiker bratvid2/);assert.match(x.replies[0],/!bratvid/)})
test('ffmpeg error does not fall back to video message',async()=>{const x=setup({exif:async()=>{throw Error('ffmpeg gagal')}});assert.equal((await x.run()).success,false);assert.equal(x.messages.length,0);assert.match(x.replies[0],/ffmpeg gagal/)})
test('missing text uses active prefix and makes no API request',async()=>{const x=setup();assert.equal((await x.run('', '#')).success,false);assert.equal(x.urls.length,0);assert.match(x.replies[0],/#bratvid2/)})
test('send failure does not retry as video',async()=>{const x=setup({sendFail:true});assert.equal((await x.run()).success,false);assert.equal(x.messages.length,1);await verifySticker(x.messages[0],true)})
