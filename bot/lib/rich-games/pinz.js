import axios from 'axios';
import { randomUUID } from 'node:crypto';

const API = 'https://theresapis.vercel.app/search/pinterest?q=';
const UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';

const DEFAULT_N = 20;
const MAX_N = 30;
const FETCH_EXTRA = 10;
const SRC_SIZE = '474x';
const GRID_W = 380;
const JPEG_Q = 70;
const MAX_IMG = 70 * 1024;
const MAX_TOTAL = 700 * 1024;
const CONCURRENCY = 6;

// Metadata matches the interactive HTML messages already used by this SC.
const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA==";
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg";
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYvNBkuLoZnQAq4j8yRekrQ==";

const isPin = (u) => /^https?:\/\/[^/]*pinimg\.com\//i.test(u);
const srcOf = (u) => u.replace(/\/(?:originals|\d+x)\//, '/' + SRC_SIZE + '/');
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

let sharpP;
const getSharp = () => (sharpP ??= import('sharp').then((m) => m.default).catch(() => null));

async function search(q) {
  const { data } = await axios.get(API + encodeURIComponent(q), {
    headers: { 'User-Agent': UA }, timeout: 20000,
  });
  const res = Array.isArray(data?.result) ? data.result : [];
  const urls = [];
  for (const p of res) {
    const u = p?.directLink || p?.link;
    if (typeof u === 'string' && isPin(u) && !urls.includes(u)) urls.push(u);
  }
  return urls;
}

async function getImg(url) {
  try {
    const r = await axios.get(srcOf(url), {
      responseType: 'arraybuffer', timeout: 20000,
      maxContentLength: 3 * 1024 * 1024,
      headers: { 'User-Agent': UA, Referer: 'https://www.pinterest.com/' },
    });
    let buf = Buffer.from(r.data);
    let mime = String(r.headers['content-type'] || '').split(';')[0];
    if (!mime.startsWith('image/') || !buf.length) return null;
    const sharp = await getSharp();
    if (sharp) {
      try {
        buf = await sharp(buf).resize({ width: GRID_W, withoutEnlargement: true }).jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer();
        mime = 'image/jpeg';
      } catch {}
    }
    if (buf.length > MAX_IMG) return null;
    return { url, mime, b64: buf.toString('base64') };
  } catch {
    return null;
  }
}

async function pool(list, n, fn) {
  const out = new Array(list.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, list.length) }, async () => {
    while (i < list.length) {
      const k = i++;
      out[k] = await fn(list[k]);
    }
  }));
  return out;
}

function buildHtml(query, items) {
  let colL = '', colR = '';
  items.forEach((it, i) => {
    const cell = '<div class="cell" data-i="' + i + '"><img src="data:' + it.mime + ';base64,' + it.b64 + '" alt=""></div>';
    if (i % 2 === 0) colL += cell;
    else colR += cell;
  });
  const links = JSON.stringify(items.map((x) => x.url)).replace(/</g, '\\u003c');
  const qjson = JSON.stringify(query).replace(/</g, '\\u003c');
  return `
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{background:transparent!important}
body{color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;user-select:none;-webkit-user-select:none;padding:2px;overflow-x:hidden}
.card{width:100%;max-width:420px;margin:0 auto;position:relative;padding:10px 12px 12px;border:4px solid rgba(255,255,255,.10);border-radius:26px;background:linear-gradient(165deg,#1a1a22,#0c0c12 55%,#101018);box-shadow:inset 0 0 0 3px rgba(0,0,0,.45),0 8px 24px rgba(0,0,0,.45)}
.topbar{display:flex;gap:8px;padding:2px 2px 8px}.topbar input{flex:1;min-width:0;height:40px;border-radius:20px;border:2px solid rgba(255,255,255,.16);background:rgba(0,0,0,.35);color:#fff;padding:0 15px;font-size:13.5px;outline:none}.topbar input:focus{border-color:#e60023}
.topbar button{height:40px;min-width:64px;border:0;border-radius:20px;background:linear-gradient(#ff4d5e,#e60023);color:#fff;font-weight:800;font-size:13px;box-shadow:0 3px rgba(120,0,15,.8);cursor:pointer}
.chips{display:flex;gap:6px;overflow-x:auto;padding:0 2px 8px;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}.chip{flex:0 0 auto;padding:5px 12px;border-radius:14px;background:rgba(255,255,255,.12);color:#fff;font-size:11.5px;border:none;cursor:pointer}
.screen{position:relative;height:min(150vw,600px);min-height:340px;border-radius:18px;overflow:hidden;background:#0a0a0e;border:3px solid rgba(0,0,0,.55);box-shadow:inset 0 0 0 2px rgba(255,255,255,.05)}
.gr{position:absolute;inset:0;overflow-y:auto;padding:8px;touch-action:pan-y;overflow-anchor:none}.round{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}.gcol{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}.cell{border-radius:12px;overflow:hidden;background:#17171f;cursor:pointer;width:100%}.cell img{width:100%;display:block}.cell:active{opacity:.8}
.gnav{position:absolute;right:8px;z-index:5;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(20,20,28,.9);color:#fff;font-size:14px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.5)}.gnav.up{bottom:52px}.gnav.dn{bottom:10px}.gnav:active{transform:scale(.9)}
.fs{position:absolute;inset:0;z-index:20;display:none;flex-direction:column;background:#000}.fs.on{display:flex}.fbar{flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(0,0,0,.85)}.fbar .fpos{flex:1;text-align:center;font:bold 11px monospace;letter-spacing:.5px;opacity:.9}
.fbtn{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.1);color:#fff;font-size:15px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}.fbtn:active{transform:scale(.9)}.fbtn.dl{background:#e60023;border-color:#ff6b76}.fbtn.lk{background:rgba(255,255,255,.16)}
.fscroll{flex:1;overflow-y:auto;scroll-snap-type:y mandatory;touch-action:pan-y}.fslide{height:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;padding:6px}.fslide img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px}
.fnav{position:absolute;right:10px;z-index:6;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(28,28,38,.92);color:#fff;font-size:15px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.55)}.fnav.up{bottom:74px}.fnav.dn{bottom:24px}.fnav:active{transform:scale(.9)}
.toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%) translateY(16px);background:rgba(25,25,32,.95);padding:8px 14px;border-radius:12px;font-size:11.5px;opacity:0;transition:all .25s;z-index:30;pointer-events:none;max-width:88%;text-align:center}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
</style>
<div class="card"><div class="topbar"><input id="q" type="search" placeholder="Cari di Pinterest..." enterkeyhint="search"><button id="go">Cari</button></div><div class="chips" id="chips"></div>
<div class="screen" id="screen"><div class="gr" id="grid"><div class="round" id="r0"><div class="gcol">${colL}</div><div class="gcol">${colR}</div></div></div><button class="gnav up" id="gup">▲</button><button class="gnav dn" id="gdn">▼</button>
<div class="fs" id="fs"><div class="fbar"><button class="fbtn" id="fBack">←</button><div class="fpos" id="fPos">1 / 1</div><button class="fbtn lk" id="fLink" title="Salin link">🔗</button><button class="fbtn dl" id="fDl" title="Salin .pinsave">⬇️</button></div><div class="fscroll" id="fscroll"></div><button class="fnav up" id="fUp">▲</button><button class="fnav dn" id="fDn">▼</button></div><div class="toast" id="toast"></div></div></div>
<script>(function(){
var LINKS=${links}, QDEF=${qjson}, N=LINKS.length;
var grid=document.getElementById('grid'),base=document.getElementById('r0'),fsEl=document.getElementById('fs'),fscroll=document.getElementById('fscroll'),fPos=document.getElementById('fPos'),toastEl=document.getElementById('toast'),input=document.getElementById('q');
var cur=0,toastT=null,tpl=null,inited=false,rounds=1,fT=null;
try{var meta=document.createElement('meta');meta.name='viewport';meta.content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';document.head.appendChild(meta)}catch(e){}
input.value=QDEF;
function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show')},3000)}
function copyText(t,okMsg){var started=false;try{if(navigator.clipboard&&navigator.clipboard.writeText){started=true;navigator.clipboard.writeText(t).then(function(){toast(okMsg)}).catch(function(){fallback(t,okMsg)})}}catch(e){}if(!started)fallback(t,okMsg);function fallback(t2,m2){try{var ta=document.createElement('textarea');ta.value=t2;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();var ok=document.execCommand('copy');ta.remove();toast(ok?m2:'Gagal menyalin')}catch(e){toast('Gagal menyalin')}}}
function lock(im){try{if(im.naturalWidth)im.style.aspectRatio=im.naturalWidth+' / '+im.naturalHeight}catch(e){}}
function init(){if(inited)return;inited=true;var ch=grid.clientHeight||500,h=base.offsetHeight+8;if(h>0&&h<ch*1.6){var cols=base.querySelectorAll('.gcol'),reps=Math.ceil(ch*1.6/h);for(var c=0;c<cols.length;c++){var s=cols[c].innerHTML;for(var r=1;r<reps;r++)cols[c].insertAdjacentHTML('beforeend',s)}}tpl=base.cloneNode(true);tpl.removeAttribute('id');grid.appendChild(tpl.cloneNode(true));rounds++;grid.addEventListener('scroll',onGrid)}
function onGrid(){var st=grid.scrollTop,ch=grid.clientHeight,sh=grid.scrollHeight;if(st+ch>=sh-ch*1.5){grid.appendChild(tpl.cloneNode(true));rounds++;if(rounds>12){var f=grid.firstElementChild,hh=f.offsetHeight+8;if(st>hh+ch){grid.removeChild(f);rounds--;grid.scrollTop=st-hh}}}}
var imgs=base.querySelectorAll('img'),left=imgs.length;function one(){left--;if(left<=0)init()}for(var i=0;i<imgs.length;i++){(function(im){if(im.complete&&im.naturalWidth){lock(im);one()}else{im.addEventListener('load',function(){lock(im);one()});im.addEventListener('error',one)}})(imgs[i])}setTimeout(init,2500);if(!imgs.length)init();
grid.addEventListener('click',function(e){var t=e.target;while(t&&t!==grid&&!(t.classList&&t.classList.contains('cell')))t=t.parentNode;if(t&&t!==grid)openFs(parseInt(t.getAttribute('data-i'),10))});
document.getElementById('gup').addEventListener('click',function(){grid.scrollBy({top:-Math.round(grid.clientHeight*.8),behavior:'smooth'})});document.getElementById('gdn').addEventListener('click',function(){grid.scrollBy({top:Math.round(grid.clientHeight*.8),behavior:'smooth'})});
function H(){return fscroll.clientHeight||400}function hdUrl(u){return String(u).replace(/\\/(?:originals|\\d+x)\\//,'/736x/')}function mkSlide(k){var sl=document.createElement('div');sl.className='fslide';sl.setAttribute('data-k',k);var s=grid.querySelector('.cell[data-i="'+k+'"] img');if(s){var im=document.createElement('img');im.src=s.src;im.alt='';sl.appendChild(im)}return sl}
function upgrade(sl){if(!sl||sl.getAttribute('data-hd'))return;sl.setAttribute('data-hd','1');var u=hdUrl(LINKS[parseInt(sl.getAttribute('data-k'),10)]),pre=new Image();pre.onload=function(){var im=sl.querySelector('img');if(im)im.src=u};pre.src=u}function hdAround(idx){for(var j=idx-1;j<=idx+1;j++)upgrade(fscroll.children[j])}
function jumpTo(idx){fscroll.style.scrollSnapType='none';fscroll.scrollTop=idx*H();setTimeout(function(){fscroll.style.scrollSnapType=''},30)}function updPos(){fPos.textContent=(cur+1)+' / '+N}
function openFs(i){if(i<0||i>=N)return;cur=i;fscroll.innerHTML='';fscroll.appendChild(mkSlide(N-1));for(var k=0;k<N;k++)fscroll.appendChild(mkSlide(k));fscroll.appendChild(mkSlide(0));fsEl.classList.add('on');requestAnimationFrame(function(){jumpTo(i+1);updPos();hdAround(i+1)})}
function closeFs(){fsEl.classList.remove('on')}function fsGo(d){fscroll.scrollBy({top:d*H(),behavior:'smooth'})}
fscroll.addEventListener('scroll',function(){var idx=Math.round(fscroll.scrollTop/H()),k=((idx-1)%N+N)%N;if(k!==cur){cur=k;updPos()}clearTimeout(fT);fT=setTimeout(function(){var i2=Math.round(fscroll.scrollTop/H());if(i2<=0){jumpTo(N);i2=N}else if(i2>=N+1){jumpTo(1);i2=1}hdAround(i2)},140)});
fsEl.addEventListener('wheel',function(e){e.preventDefault();if(e.deltaY>10)fsGo(1);else if(e.deltaY< -10)fsGo(-1)},{passive:false});
document.getElementById('fBack').addEventListener('click',closeFs);document.getElementById('fUp').addEventListener('click',function(){fsGo(-1)});document.getElementById('fDn').addEventListener('click',function(){fsGo(1)});
document.getElementById('fLink').addEventListener('click',function(){var u=LINKS[cur];if(!u){toast('Gak ada gambar');return}copyText(u,'🔗 Link gambar disalin!')});document.getElementById('fDl').addEventListener('click',function(){var u=LINKS[cur];if(!u){toast('Gak ada gambar');return}copyText('.pinsave '+u,'✅ Disalin! Paste di chat lalu kirim')});
function goSearch(q){q=(q||'').trim();if(!q){toast('Isi kata kunci dulu');return}copyText('.pinz '+q,'✅ Disalin! Paste di chat lalu kirim')}
document.getElementById('go').addEventListener('click',function(){goSearch(input.value)});input.addEventListener('keydown',function(e){if(e.key==='Enter')goSearch(input.value)});
;['anime aesthetic','wallpaper pc','anime food','kucing lucu'].forEach(function(t){var c=document.createElement('button');c.className='chip';c.textContent=t;c.addEventListener('click',function(){goSearch(t)});document.getElementById('chips').appendChild(c)});
})();</script>`;
}

async function sendHtmlRich(conn, m, html, title) {
  const responseId = randomUUID();
  const data = Buffer.from(JSON.stringify({
    __typename: 'GenAIUnifiedResponse',
    response_id: responseId,
    sections: [{
      __typename: 'GenAIUnifiedResponseSection',
      view_model: {
        __typename: 'GenAISingleLayoutViewModel',
        primitive: {
          __typename: 'GenAIaeacdsnwHtmlPrimitive',
          payload: html,
          trusted_sources: ['https://i.pinimg.com'],
        },
      },
    }],
  })).toString('base64');

  return conn.relayMessage(m.chat, {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: '',
        botResponseId: responseId,
        verificationMetadata: {
          proofs: [{ version: 1, useCase: 1, signature: SIG, certificateChain: [CERT1, CERT2] }],
        },
      },
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: title }],
          unifiedResponse: { data },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
            forwardOrigin: 4,
          },
        },
      },
    },
  }, { messageId: responseId });
}

async function sendPlain(m, conn, urls, query) {
  const medias = urls.slice(0, 10).map((u) => ({ image: { url: u }, caption: '' }));
  if (!medias.length) return;
  medias[medias.length - 1].caption = '📌 Pinterest: ' + query;
  if (typeof conn.sendAlbumMessage === 'function') {
    await conn.sendAlbumMessage(m.chat, medias, { quoted: m, delay: 500 });
  } else {
    for (const media of medias) await conn.sendMessage(m.chat, media, { quoted: m });
  }
}

const handler = async (m, { sock, text, args }) => {
  let raw = '';
  if (Array.isArray(args) && args.length) raw = args.join(' ').trim();
  if (!raw && typeof text === 'string') raw = text.trim();
  if (!raw) raw = String(m.quoted?.text || '').trim();
  if (!raw) return m.reply('Contoh:\n.pinz hutao\n.pinz wallpaper pc 30');

  let n = DEFAULT_N;
  const mt = raw.match(/^(.*\S)\s+(\d{1,2})$/);
  if (mt && Number.parseInt(mt[2], 10) > 1) {
    n = Math.min(Number.parseInt(mt[2], 10), MAX_N);
    raw = mt[1];
  }
  const query = raw.slice(0, 100);
  await m.react?.('🕕');

  let urls;
  try {
    urls = await search(query);
  } catch (e) {
    await m.react?.('❌');
    return m.reply('❌ Gagal mencari Pinterest: ' + (e?.message || e));
  }
  if (!urls.length) {
    await m.react?.('❌');
    return m.reply('Tidak ada gambar ditemukan dari Pinterest.');
  }

  const picks = shuffle(urls).slice(0, n + FETCH_EXTRA);
  const got = await pool(picks, CONCURRENCY, getImg);
  const items = [];
  let total = 0;
  for (const g of got) {
    if (!g || items.length >= n) continue;
    const size = g.b64.length * 0.75;
    if (total + size > MAX_TOTAL) break;
    items.push(g);
    total += size;
  }

  if (!items.length) {
    await m.react?.('⚠️');
    try {
      return await sendPlain(m, sock, picks, query);
    } catch (e) {
      return m.reply('❌ Thumbnail gagal dimuat dan album biasa juga gagal: ' + (e?.message || e));
    }
  }

  const html = buildHtml(query, items);
  try {
    await sendHtmlRich(sock, m, html, '📌 PINZ • ' + query + ' • ' + items.length + ' pin');
    await m.react?.('✅');
  } catch (e) {
    console.error('[pinz]', e?.message || e);
    try {
      await sendPlain(m, sock, items.map((x) => x.url), query);
    } catch (e2) {
      await m.reply('❌ Gagal mengirim grid Pinterest: ' + (e2?.message || e2));
    }
  }
};

const config = {
  name: 'pinz',
  alias: [],
  category: "rich",
  description: 'Pinterest Rich Gallery dengan grid dan fullscreen carousel',
  usage: '.pinz <query> [jumlah]',
  example: '.pinz hutao 20',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  limit: 0,
  energi: 0,
  isEnabled: true,
};

export { config, handler };
