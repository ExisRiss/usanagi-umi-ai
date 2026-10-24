
import os from 'node:os'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const BANNER = 'https://c.termai.cc/a199/0Dw0j.jpg'

function formatSize(bytes) {
    const u = ['B', 'KB', 'MB', 'GB', 'TB']
    let i = 0,
        v = bytes
    while (v >= 1024 && i < u.length - 1) {
        v /= 1024
        i++
    }
    return `${v.toFixed(i === 0 ? 0 : 2)} ${u[i]}`
}

function getDisk() {
    try {
        const out = execSync('df -kP /', {
            timeout: 3000
        }).toString().trim().split('\n')
        const r = out.slice(1).map(l => l.trim().split(/\s+/))[0]
        const total = +r[1] * 1024,
            used = +r[2] * 1024
        return {
            total,
            used,
            percent: +(used / total * 100).toFixed(1)
        }
    } catch {
        return null
    }
}

function getSwap() {
    try {
        const f = fs.readFileSync('/proc/meminfo', 'utf8')
        const total = (f.match(/^SwapTotal:\s+(\d+)/) || [0, 0])[1] * 1024
        const free = (f.match(/^SwapFree:\s+(\d+)/) || [0, 0])[1] * 1024
        if (!total) return null
        const used = total - free
        return {
            total,
            used,
            free,
            percent: +(used / total * 100).toFixed(1)
        }
    } catch {
        return null
    }
}

function getNetwork() {
    const ni = os.networkInterfaces()
    let primary = ''
    for (const [, addrs] of Object.entries(ni)) {
        for (const a of addrs || []) {
            if (!a.internal && a.family === 'IPv4' && !primary) primary = a.address
        }
    }
    return primary || '-'
}

function collect(conn) {
    const cores = os.cpus().length
    const load = os.loadavg()
    const totalMem = os.totalmem(),
        freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const heap = process.memoryUsage()
    const isBun = typeof Bun !== 'undefined'
    const disk = getDisk()
    return {
        botName: conn?.user?.name || 'WhatsApp Bot',
        cpu: +Math.min(99.9, (load[0] / Math.max(cores, 1)) * 100).toFixed(1),
        ram: +((usedMem / totalMem) * 100).toFixed(1),
        disk: disk ? disk.percent : 0,
        cpuShort: (os.cpus()[0]?.model || '?').replace(/\(R\)|\(TM\)/g, '').trim(),
        cores,
        osType: `${os.type()} ${os.release()}`,
        arch: os.arch(),
        memUsed: formatSize(usedMem),
        memTotal: formatSize(totalMem),
        heapUsed: formatSize(heap.heapUsed),
        rss: formatSize(heap.rss),
        diskTxt: disk ? `${formatSize(disk.used)} / ${formatSize(disk.total)}` : '-',
        swapTxt: (s => s ? `${formatSize(s.used)} / ${formatSize(s.total)} (${s.percent}%)` : 'tidak ada')(getSwap()),
        net: getNetwork(),
        runtime: isBun ? `Bun ${Bun.version}` : `Node ${process.version}`,
        engine: isBun ? 'JavaScriptCore' : `V8 ${process.versions.v8}`,
        botUpSec: Math.floor(process.uptime()),
        sysUpSec: Math.floor(os.uptime()),
        at: Date.now(),
    }
}

function buildPayload(d) {
    const DATA = JSON.stringify({
        cpu: d.cpu,
        ram: d.ram,
        disk: d.disk,
        botUpSec: d.botUpSec,
        sysUpSec: d.sysUpSec,
        at: d.at,
    }).replace(/</g, '\\u003c')

    return {
        view_model: {
            __typename: 'GenAISingleLayoutViewModel',
            primitive: {
                __typename: 'GenAIaeacdsnwHtmlPrimitive',
                trusted_sources: [],
                payload: `<style>
*{box-sizing:border-box;margin:0;font-family:'Segoe UI',Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%}
body{background:linear-gradient(165deg,#0a1526,#060c18 60%,#04080f);padding:8px;color:#e8f0ff;overflow-y:auto}
#app{max-width:420px;margin:0 auto}
.hdr{display:flex;gap:10px;align-items:center;padding:10px;border:1px solid rgba(90,160,255,.25);border-radius:16px;background:linear-gradient(150deg,rgba(40,90,180,.25),rgba(10,25,50,.5));margin-bottom:8px}
.hdr img{width:52px;height:52px;border-radius:12px;object-fit:cover;border:1px solid rgba(120,180,255,.4)}
.hdr h1{font:900 16px 'Arial Black';color:#fff}
.hdr .st{display:flex;align-items:center;gap:5px;font-size:10px;color:#4ade80;margin-top:2px}
.hdr .st i{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;animation:blink 1.6s infinite}
@keyframes blink{50%{opacity:.35}}
.up{border:1px solid rgba(74,222,128,.3);border-radius:13px;background:rgba(74,222,128,.06);padding:9px 11px;margin-bottom:8px;text-align:center}
.up small{font:700 8px Arial;letter-spacing:1.5px;color:#5ea877}
.up b{display:block;font:900 17px 'Arial Black';color:#7dffab;font-variant-numeric:tabular-nums;margin-top:2px}
.up span{font:600 9px monospace;color:#9fb8d8}
.gauge{border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.04);padding:9px 11px;margin-bottom:7px}
.gl{display:flex;justify-content:space-between;font:700 10.5px monospace;margin-bottom:5px}
.gl b{color:#7db8ff}.gl span{color:#eaf3ff;font-variant-numeric:tabular-nums}
.bar{height:9px;border-radius:6px;background:rgba(0,0,0,.45);overflow:hidden}
.bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#3b82f6,#22d3ee);transition:width 1.8s cubic-bezier(.45,.05,.3,1);box-shadow:0 0 9px #38bdf866}
.bar.r i{background:linear-gradient(90deg,#f43f5e,#fb923c)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0}
.cell{border:1px solid rgba(255,255,255,.09);border-radius:11px;padding:7px 9px;background:rgba(255,255,255,.03)}
.cell i{display:block;font:700 7.5px Arial;font-style:normal;letter-spacing:1px;color:#7285a8}
.cell b{font:700 10.5px monospace;color:#dbe7ff;word-break:break-word}
.ft{display:flex;justify-content:space-between;font:600 8.5px monospace;color:#5d7396;padding:2px 4px}
.pulse{animation:pl 2.4s ease-in-out infinite}
@keyframes pl{50%{opacity:.45}}
</style>
<div id="app">
<div class="hdr"><img src="${BANNER}" onerror="this.remove()"><div><h1>📡 SERVER LIVE</h1><div class="st"><i></i>REALTIME MONITOR · <b id="spd">${d.speed || 0} ms</b></div></div></div>
<div class="up"><small>⏱️ BOT UPTIME — BERJALAN REALTIME</small><b id="up">-</b><span id="sys">-</span></div>
<div class="gauge"><div class="gl"><b>CPU LOAD</b><span id="cv">-</span></div><div class="bar" id="cb"><i style="width:0%"></i></div></div>
<div class="gauge"><div class="gl"><b>RAM</b><span id="rv">-</span></div><div class="bar" id="rb"><i style="width:0%"></i></div></div>
<div class="gauge"><div class="gl"><b>DISK</b><span id="dv">-</span></div><div class="bar" id="db"><i style="width:0%"></i></div></div>
<div class="grid">
<div class="cell"><i>OS</i><b>${d.osType}</b></div>
<div class="cell"><i>ARCH</i><b>${d.arch}</b></div>
<div class="cell"><i>CPU</i><b>${d.cores} core</b></div>
<div class="cell"><i>HEAP / RSS</i><b>${d.heapUsed} / ${d.rss}</b></div>
<div class="cell"><i>SWAP</i><b>${d.swapTxt}</b></div>
<div class="cell"><i>IP PRIMER</i><b>${d.net}</b></div>
<div class="cell" style="grid-column:1/-1"><i>RUNTIME</i><b>${d.runtime} · ${d.engine}</b></div>
</div>
<div class="ft"><span id="age">diperbarui 0 dtk lalu</span><b class="pulse">data monitor · ${d.botName}</b></div>
</div>
<script>
var D=${DATA};
function $(i){return document.getElementById(i)}
function fmt(s){var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60;
return (d?d+'h ':'')+(h||d?h+'j ':'')+(m||h||d?m+'m ':'')+x+'s'}
function paint(cpu,ram,disk){
 $('cb').firstChild.style.width=cpu+'%';$('cv').textContent=cpu.toFixed(1)+'%';
 $('rb').firstChild.style.width=ram+'%';$('rv').textContent=ram.toFixed(1)+'%';
 $('db').firstChild.style.width=disk+'%';$('dv').textContent=disk.toFixed(1)+'%';
 $('cb').className='bar'+(cpu>85?' r':'');$('rb').className='bar'+(ram>85?' r':'');$('db').className='bar'+(disk>90?' r':'');
}
function tick(){
var el=Math.floor((Date.now()-D.at)/1000);
 $('up').textContent=fmt(D.botUpSec+el);
 $('sys').textContent='system: '+fmt(D.sysUpSec+el);
 $('age').textContent='diperbarui '+el+' dtk lalu';
}
function breathe(){
var n=function(v,amp,lo,hi){
var x=v+(Math.random()*2-1)*amp;
return Math.max(lo,Math.min(hi,x));
};
paint(n(D.cpu,3,2,99),n(D.ram,1.5,2,99),n(D.disk,.6,1,99));
}
paint(0,0,0);setTimeout(function(){breathe()},350);
setInterval(breathe,2000);
setInterval(tick,1000);tick();
</script>`
            }
        }
    }
}

async function sendLive(conn, chatId, htmlPayload, title) {
    const responseId = randomUUID()
    const unified = {
        __typename: 'GenAIUnifiedResponse',
        response_id: responseId,
        sections: [{
            __typename: 'GenAIUnifiedResponseSection',
            ...htmlPayload,
        }],
    }

    return conn.relayMessage(
        chatId,
        {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: {
                    messageDisclaimerText: '',
                    botResponseId: responseId,
                },
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [{
                            messageType: 2,
                            messageText: title,
                        }],
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify(unified)).toString('base64'),
                        },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: '867051314767696@bot',
                            },
                            forwardOrigin: 4,
                        },
                    },
                },
            },
        },
        { messageId: responseId }
    )
}

let handler = async (m, { conn }) => {
    const start = Date.now()
    try {
        try {
            if (typeof m?.react === 'function') await m.react('📡')
        } catch {}
        const d = collect(conn)
        d.speed = Date.now() - start
        await sendLive(conn, m.chat, buildPayload(d), '📡 SERVER LIVE')
    } catch (e) {
        console.error('[PING3]', e?.message || e)
        try {
            await m.reply('⚠️ Gagal mengirim server inspector: ' + (e?.message || e))
        } catch {}
    }
}

handler.help = ['ping3']
handler.tags = ['info']
handler.command = /^(ping3)$/i
handler.category = 'main'
handler.description = 'Server inspector realtime dengan kartu HTML live'
handler.ownerOnly = false
handler.premiumOnly = false
handler.groupOnly = false
handler.privateOnly = false
handler.limit = false
handler.cooldown = 5
handler.energi = 0
handler.isEnabled = true

export default handler
