// dashboard.js
// 📊 Live Bot Dashboard
// ESM Plugin
// RAM + CPU snapshot saat command dipanggil
// Uptime berjalan live di HTML

import os from 'os'

const getCPUUsage = () => {
  const cpus = os.cpus()

  if (!cpus?.length) return 0

  let idle = 0
  let total = 0

  for (const cpu of cpus) {
    idle += cpu.times.idle

    total +=
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq
  }

  if (!total) return 0

  return Math.round(
    (1 - idle / total) * 100
  )
}

const formatBytes = bytes => {
  const gb = bytes / 1024 / 1024 / 1024

  return gb >= 1
    ? `${gb.toFixed(2)} GB`
    : `${(bytes / 1024 / 1024).toFixed(0)} MB`
}

const formatUptime = seconds => {
  seconds = Math.floor(seconds)

  const d = Math.floor(seconds / 86400)
  seconds %= 86400

  const h = Math.floor(seconds / 3600)
  seconds %= 3600

  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return {
    d,
    h,
    m,
    s
  }
}

const html = ({
  cpu,
  ramUsed,
  ramTotal,
  ramPercent,
  uptime,
  nodeVersion,
  platform,
  hostname,
  cpuCount,
  pid
}) => {

  const initialUptime =
    uptime.d * 86400 +
    uptime.h * 3600 +
    uptime.m * 60 +
    uptime.s

  return `
<style>
:root{
  --bg:#0b141a;
  --card:#111b21;
  --card2:#202c33;
  --line:#2a3942;
  --text:#e9edef;
  --muted:#8696a0;
  --green:#00a884;
  --green2:#25d366;
  --orange:#ffb020;
  --red:#ff5c5c;
}

*{
  box-sizing:border-box;
  margin:0;
  padding:0;
  -webkit-tap-highlight-color:transparent;
}

html,
body{
  background:transparent;
  color:var(--text);
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
}

.stage{
  min-height:100vh;
  padding:20px 14px;
  display:flex;
  justify-content:center;
}

.dashboard{
  width:100%;
  max-width:390px;
}

.header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding-bottom:15px;
  margin-bottom:14px;
  border-bottom:1px solid var(--line);
}

.title{
  display:flex;
  align-items:center;
  gap:10px;
}

.title-icon{
  width:38px;
  height:38px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(0,168,132,.14);
  border-radius:10px;
  font-size:19px;
}

.title h1{
  font-size:17px;
  font-weight:700;
}

.title p{
  margin-top:2px;
  font-size:11px;
  color:var(--muted);
}

.live{
  display:flex;
  align-items:center;
  gap:6px;
  color:var(--green2);
  font-size:10px;
  font-weight:700;
  letter-spacing:.5px;
}

.live-dot{
  width:7px;
  height:7px;
  border-radius:50%;
  background:var(--green2);
  box-shadow:0 0 0 4px rgba(37,211,102,.10);
  animation:pulse 1.5s infinite;
}

@keyframes pulse{
  0%,100%{
    transform:scale(1);
    opacity:1;
  }
  50%{
    transform:scale(.75);
    opacity:.55;
  }
}

.main-card{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:14px;
  overflow:hidden;
}

.metric{
  padding:18px;
  border-bottom:1px solid var(--line);
}

.metric:last-child{
  border-bottom:0;
}

.metric-head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:10px;
}

.metric-name{
  color:var(--muted);
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.5px;
}

.metric-value{
  font-size:24px;
  font-weight:700;
}

.metric-value small{
  font-size:12px;
  color:var(--muted);
  font-weight:500;
}

.bar{
  width:100%;
  height:7px;
  background:#26343b;
  border-radius:10px;
  overflow:hidden;
}

.bar-fill{
  height:100%;
  width:0;
  border-radius:10px;
  background:var(--green);
  transition:width .7s ease;
}

.metric-info{
  margin-top:8px;
  display:flex;
  justify-content:space-between;
  color:var(--muted);
  font-size:10px;
}

.uptime{
  font-size:25px;
  letter-spacing:.3px;
}

.info-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-top:14px;
}

.info{
  padding:13px;
  background:var(--card);
  border:1px solid var(--line);
  border-radius:11px;
}

.info-label{
  color:var(--muted);
  font-size:10px;
  margin-bottom:5px;
}

.info-value{
  font-size:12px;
  font-weight:600;
  word-break:break-word;
}

.status{
  margin-top:12px;
  padding:13px 15px;
  background:rgba(0,168,132,.08);
  border:1px solid rgba(0,168,132,.2);
  border-radius:11px;
  display:flex;
  align-items:center;
  gap:9px;
}

.status-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:var(--green2);
}

.status-text{
  font-size:11px;
}

.footer{
  margin-top:12px;
  text-align:center;
  color:var(--muted);
  font-size:9px;
}

@media(max-width:380px){
  .stage{
    padding:15px 11px;
  }

  .metric-value{
    font-size:21px;
  }
}
</style>

<main class="stage">

  <section class="dashboard">

    <header class="header">

      <div class="title">

        <div class="title-icon">
          📊
        </div>

        <div>
          <h1>Bot Dashboard</h1>
          <p>Server monitoring</p>
        </div>

      </div>

      <div class="live">
        <span class="live-dot"></span>
        LIVE
      </div>

    </header>

    <div class="main-card">

      <!-- CPU -->

      <div class="metric">

        <div class="metric-head">

          <div class="metric-name">
            CPU Usage
          </div>

          <div
            class="metric-value"
            id="cpuValue">
            ${cpu}%
          </div>

        </div>

        <div class="bar">
          <div
            class="bar-fill"
            id="cpuBar">
          </div>
        </div>

        <div class="metric-info">

          <span>
            ${cpuCount} CPU Core
          </span>

          <span>
            Server CPU
          </span>

        </div>

      </div>

      <!-- RAM -->

      <div class="metric">

        <div class="metric-head">

          <div class="metric-name">
            Memory
          </div>

          <div
            class="metric-value"
            id="ramValue">
            ${ramPercent}%
          </div>

        </div>

        <div class="bar">
          <div
            class="bar-fill"
            id="ramBar">
          </div>
        </div>

        <div class="metric-info">

          <span>
            ${ramUsed} used
          </span>

          <span>
            ${ramTotal} total
          </span>

        </div>

      </div>

      <!-- UPTIME -->

      <div class="metric">

        <div class="metric-head">

          <div class="metric-name">
            Bot Uptime
          </div>

        </div>

        <div
          class="metric-value uptime"
          id="uptime">
          00d 00h 00m 00s
        </div>

        <div class="metric-info">

          <span>
            Process uptime
          </span>

          <span id="clock">
            --:--:--
          </span>

        </div>

      </div>

    </div>

    <div class="info-grid">

      <div class="info">

        <div class="info-label">
          NODE.JS
        </div>

        <div class="info-value">
          ${nodeVersion}
        </div>

      </div>

      <div class="info">

        <div class="info-label">
          PLATFORM
        </div>

        <div class="info-value">
          ${platform}
        </div>

      </div>

      <div class="info">

        <div class="info-label">
          HOSTNAME
        </div>

        <div class="info-value">
          ${hostname}
        </div>

      </div>

      <div class="info">

        <div class="info-label">
          PROCESS ID
        </div>

        <div class="info-value">
          ${pid}
        </div>

      </div>

    </div>

    <div class="status">

      <span class="status-dot"></span>

      <span class="status-text">
        Bot sedang berjalan normal
      </span>

    </div>

    <div class="footer">
      Dashboard generated by Bot
    </div>

  </section>

</main>

<script>

const initialUptime =
  ${initialUptime};

const startedAt =
  Date.now();

function pad(n){
  return String(n).padStart(2,'0');
}

function updateUptime(){

  const elapsed =
    Math.floor(
      (Date.now() - startedAt) / 1000
    );

  const total =
    initialUptime + elapsed;

  const d =
    Math.floor(total / 86400);

  const h =
    Math.floor(
      (total % 86400) / 3600
    );

  const m =
    Math.floor(
      (total % 3600) / 60
    );

  const s =
    total % 60;

  document
    .getElementById('uptime')
    .textContent =
      pad(d) + 'd ' +
      pad(h) + 'h ' +
      pad(m) + 'm ' +
      pad(s) + 's';

}

function updateClock(){

  const now =
    new Date();

  document
    .getElementById('clock')
    .textContent =
      now.toLocaleTimeString(
        'id-ID',
        {
          hour:'2-digit',
          minute:'2-digit',
          second:'2-digit'
        }
      );

}

function animateBars(){

  document
    .getElementById('cpuBar')
    .style.width =
      '${cpu}%';

  document
    .getElementById('ramBar')
    .style.width =
      '${ramPercent}%';

}

updateUptime();
updateClock();
animateBars();

setInterval(
  updateUptime,
  1000
);

setInterval(
  updateClock,
  1000
);

</script>
`
}

const handler = async (m, { conn }) => {

  try {

    const totalMem =
      os.totalmem()

    const freeMem =
      os.freemem()

    const usedMem =
      totalMem - freeMem

    const ramPercent =
      Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (usedMem / totalMem) * 100
          )
        )
      )

    const cpu =
      getCPUUsage()

    const uptime =
      formatUptime(
        process.uptime()
      )

    const page =
      html({

        cpu,

        ramUsed:
          formatBytes(usedMem),

        ramTotal:
          formatBytes(totalMem),

        ramPercent,

        uptime,

        nodeVersion:
          process.version,

        platform:
          `${os.type()} ${os.arch()}`,

        hostname:
          os.hostname(),

        cpuCount:
          os.cpus().length,

        pid:
          process.pid

      })

    await conn.relayMessage(
      m.chat,
      {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
          botMetadata: {}
        },

        botForwardedMessage: {

          message: {

            richResponseMessage: {

              messageType: 1,

              submessages: [
                {
                  messageType: 2,
                  messageText:
                    '📊 Bot Dashboard — Live Monitor'
                }
              ],

              unifiedResponse: {

                data: Buffer.from(
                  JSON.stringify({

                    response_id:
                      'bot-dashboard-live-2026',

                    sections: [

                      {
                        view_model: {

                          primitive: {

                            __typename:
                              'GenAIaeacdsnwHtmlPrimitive',

                            payload:
                              page,

                            trusted_sources: []

                          },

                          __typename:
                            'GenAISingleLayoutViewModel'

                        }

                      }

                    ]

                  })
                ).toString('base64')

              },

              contextInfo: {

                forwardingScore: 1,

                isForwarded: true,

                forwardedAiBotMessageInfo: {

                  botJid:
                    '867051314767696@bot'

                },

                forwardOrigin: 4

              }

            }

          }

        }

      },
      {}
    )

  } catch (e) {

    console.error(
      '[DASHBOARD ERROR]',
      e
    )

    await m.reply(
      '❌ Gagal membuka dashboard.'
    )

  }

}

handler.help = [
  'dashboardlive',
  'dashlive',
  'statusbotlive'
]

handler.tags = [
  'info'
]

handler.command = [
  'dashlive',
  'dashboardlive',
  'statusbotlive'
]

handler.limit = false

export default handler