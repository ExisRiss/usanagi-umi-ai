/* Backup Control — dashboard admin.
 *
 * Semua data berasal dari /api/backup/* (Vercel) yang meneruskan ke server bot.
 * Sesi memakai Supabase Auth yang sama dengan website; token disimpan di
 * sessionStorage (hilang saat tab ditutup) dan diperbarui otomatis.
 */
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ebpebtzCNxvsKWb0xtgX_A_ClzPlhob'
const STORAGE_KEY = 'umi_backup_session'

const state = {
  session: null,
  status: null,
  backups: [],
  total: 0,
  offset: 0,
  limit: 15,
  filters: { status: '', q: '' },
  logs: [],
  logTab: 'all',
  pollTimer: null,
  busy: false,
  modalAction: null,
}

const $ = id => document.getElementById(id)

/* ------------------------------------------------------------ session */
function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.access_token) return null
    return parsed
  } catch {
    return null
  }
}

function saveSession(session) {
  state.session = session
  if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  else sessionStorage.removeItem(STORAGE_KEY)
  $('logoutBtn').classList.toggle('hidden', !session)
}

async function login(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.msg || 'Email atau password salah.')
  }
  saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (Number(data.expires_in || 3600) - 60) * 1000,
  })
}

async function refreshSession() {
  const session = state.session
  if (!session || !session.refresh_token) return false
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  })
  if (!response.ok) return false
  const data = await response.json().catch(() => ({}))
  if (!data.access_token) return false
  saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token || session.refresh_token,
    expires_at: Date.now() + (Number(data.expires_in || 3600) - 60) * 1000,
  })
  return true
}

/* ------------------------------------------------------------ api */
async function api(path, { method = 'GET', body, retry = true, raw = false } = {}) {
  if (state.session && state.session.expires_at && Date.now() > state.session.expires_at) {
    await refreshSession()
  }
  const headers = { Accept: 'application/json' }
  if (state.session?.access_token) headers.Authorization = `Bearer ${state.session.access_token}`
  if (body !== undefined && !(body instanceof Blob)) headers['Content-Type'] = 'application/json'
  const response = await fetch(`/api/backup/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : (body instanceof Blob ? body : JSON.stringify(body)),
  })
  if (response.status === 401 && retry) {
    if (await refreshSession()) return api(path, { method, body, retry: false, raw })
    saveSession(null)
    showAuth('Sesi berakhir, silakan masuk lagi.')
    throw new Error('Sesi berakhir.')
  }
  if (raw) return response
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
  return data
}

/* ------------------------------------------------------------ helpers */
function fmtBytes(bytes) {
  const value = Number(bytes || 0)
  if (!value) return '0 B'
  if (value < 1024) return `${value} B`
  if (value < 1048576) return `${(value / 1024).toFixed(1)} KB`
  if (value < 1073741824) return `${(value / 1048576).toFixed(2)} MB`
  return `${(value / 1073741824).toFixed(2)} GB`
}

function fmtDate(iso) {
  if (!iso) return '–'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '–'
  return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

function fmtDuration(ms) {
  const value = Number(ms || 0)
  if (!value) return '–'
  if (value < 1000) return `${value} ms`
  if (value < 60000) return `${(value / 1000).toFixed(1)} s`
  return `${Math.floor(value / 60000)}m ${Math.round((value % 60000) / 1000)}s`
}

function timeAgo(iso) {
  if (!iso) return '–'
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff)) return '–'
  if (diff < 0) return `dalam ${fmtDuration(-diff)}`
  if (diff < 60000) return `${Math.round(diff / 1000)} detik lalu`
  if (diff < 3600000) return `${Math.round(diff / 60000)} menit lalu`
  if (diff < 86400000) return `${Math.round(diff / 3600000)} jam lalu`
  return `${Math.round(diff / 86400000)} hari lalu`
}

function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toast(message, kind = 'ok') {
  const node = document.createElement('div')
  node.className = `toast ${kind}`
  node.textContent = message
  $('toasts').appendChild(node)
  setTimeout(() => node.remove(), 5200)
}

const STATUS_LABEL = {
  completed: ['Selesai', 'ok'],
  failed: ['Gagal', 'bad'],
  running: ['Berjalan', 'info'],
  queued: ['Antre', 'warn'],
  partial: ['Sebagian', 'warn'],
}

function statusBadge(status) {
  const [label, kind] = STATUS_LABEL[status] || [status || '–', 'idle']
  return `<span class="badge ${kind}">${escapeHtml(label)}</span>`
}

function verifyBadge(status) {
  if (status === 'verified') return '<span class="badge ok">verified</span>'
  if (status === 'failed') return '<span class="badge bad">gagal</span>'
  return '<span class="badge idle">pending</span>'
}

/* ------------------------------------------------------------ render */
function showAuth(message = '') {
  $('authView').classList.remove('hidden')
  $('appView').classList.add('hidden')
  $('loginMsg').textContent = message
  $('statusText').textContent = 'belum masuk'
  $('statusDot').className = 'dot'
  stopPolling()
}

function showApp() {
  $('authView').classList.add('hidden')
  $('appView').classList.remove('hidden')
  $('logoutBtn').classList.remove('hidden')
}

function renderStatus(status) {
  state.status = status
  const scheduler = status.scheduler
  const backups = status.backups
  const storage = status.storage

  $('statusText').textContent = status.ok ? (scheduler.running ? 'backup berjalan' : 'sistem sehat') : 'perlu perhatian'
  $('statusDot').className = `dot ${status.ok ? (scheduler.running ? 'warn' : 'ok') : 'bad'}`

  $('statScheduler').textContent = scheduler.enabled ? `${scheduler.intervalMinutes} mnt` : 'nonaktif'
  $('statSchedulerFoot').textContent = scheduler.enabled
    ? `Berikutnya ${timeAgo(scheduler.nextRunAt)} · terlewat ${scheduler.missedSlots}`
    : 'Scheduler dimatikan administrator'

  const last = backups.last
  $('statLast').textContent = last ? statusBadge(last.status).replace(/<[^>]+>/g, '') : '–'
  $('statLastFoot').textContent = last
    ? `${fmtDate(last.startedAt)} · ${fmtBytes(last.sizeBytes)} · ${fmtDuration(last.durationMs)}`
    : 'Belum ada backup'

  $('stat24').textContent = `${backups.last24h.success}`
  $('stat24Foot').textContent = `${backups.last24h.failed} gagal · ${fmtBytes(backups.last24h.bytes)} total`

  const percent = storage.limitBytes ? Math.min(100, Math.round((storage.usedBytes / storage.limitBytes) * 1000) / 10) : 0
  $('statStorage').innerHTML = `${fmtBytes(storage.usedBytes)}<small>/ ${fmtBytes(storage.limitBytes)}</small>`
  const bar = $('storageBar')
  bar.className = `stat-bar${percent > 90 ? ' bad' : percent > 70 ? ' warn' : ''}`
  bar.firstElementChild.style.width = `${percent}%`
  $('statStorageFoot').textContent = `Disk sisa ${fmtBytes(storage.diskFreeBytes)} (${percent}% kuota arsip)`

  const db = status.database
  $('statDb').textContent = db.ok ? 'OK' : 'gangguan'
  $('statDbFoot').textContent = `SQLite ${fmtBytes(db.sqlite.bytes)} · ${db.sqlite.tables || 0} tabel · quick_check ${db.sqlite.check || '–'}`

  const external = storage.external || {}
  $('statExternal').textContent = external.ready ? (external.ok ? 'terhubung' : 'gangguan') : 'nonaktif'
  $('statExternalFoot').textContent = external.ready
    ? `${external.backend} · mode ${state.status?.scheduler ? '' : ''}${status.storage.external.backend}`
    : (external.reason || 'belum dikonfigurasi')

  $('toggleScheduler').textContent = scheduler.enabled ? 'Nonaktifkan scheduler' : 'Aktifkan scheduler'
  $('intervalInput').value = scheduler.intervalMinutes

  $('healthKv').innerHTML = [
    ['Worker', `${status.service.uptimeSeconds}s · ${status.service.memoryMb} MB`],
    ['Database', `${db.sqlite.tables || 0} tabel · ${db.sqlite.check || '–'}`],
    ['Sesi bot', `${status.sessions.sessions} folder`],
    ['Telegram', status.telegram.polling ? `@${escapeHtml(status.telegram.username || '')}` : (status.telegram.configured ? 'terputus' : 'belum aktif')],
    ['Arsip', `${backups.total} total · ${backups.completed} selesai`],
    ['Dihapus retensi', `${scheduler.missedSlots} slot terlewat`],
  ].map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`).join('')

  $('healthChecks').innerHTML = status.checks.map(check => `
    <div class="check">
      <span class="dot ${check.ok ? 'ok' : 'bad'}"></span>
      <strong>${escapeHtml(check.id)}</strong>
      <span>${escapeHtml(check.detail || '')}</span>
    </div>`).join('')

  const warnings = []
  if (!scheduler.enabled) warnings.push(['warn', 'Scheduler dimatikan — backup otomatis tidak berjalan.'])
  if (scheduler.lastError) warnings.push(['bad', `Error terakhir: ${scheduler.lastError}`])
  if (storage.diskFreeBytes !== null && storage.diskFreeBytes < 512 * 1024 * 1024) warnings.push(['warn', `Disk tersisa ${fmtBytes(storage.diskFreeBytes)}.`])
  if (backups.last24h.failed > 0) warnings.push(['bad', `${backups.last24h.failed} backup gagal dalam 24 jam terakhir.`])
  const banner = $('banner')
  if (warnings.length) {
    banner.className = `banner ${warnings[0][0] === 'bad' ? 'bad' : 'warn'}`
    banner.innerHTML = warnings.map(([, text]) => escapeHtml(text)).join(' · ')
  } else {
    banner.className = 'banner hidden'
    banner.textContent = ''
  }
}

function renderBackups(payload) {
  state.backups = payload.items || []
  state.total = payload.total || 0
  const rows = state.backups.map(row => `
    <tr>
      <td data-label="Waktu" class="nowrap">${fmtDate(row.startedAt)}</td>
      <td data-label="ID" class="mono">${escapeHtml(row.id)}</td>
      <td data-label="Jenis">${escapeHtml(row.type)}${row.encrypted ? ' <span class="badge idle">enc</span>' : ''}</td>
      <td data-label="Ukuran" class="nowrap">${fmtBytes(row.sizeBytes)}</td>
      <td data-label="Durasi" class="nowrap">${fmtDuration(row.durationMs)}</td>
      <td data-label="Verifikasi">${verifyBadge(row.verifyStatus)}</td>
      <td data-label="Status">${statusBadge(row.status)}</td>
      <td data-label="Aksi">
        <div class="row-actions">
          <button class="btn btn-sm" data-action="download" data-id="${escapeHtml(row.id)}" ${row.status === 'completed' ? '' : 'disabled'}>Unduh</button>
          <button class="btn btn-sm" data-action="verify" data-id="${escapeHtml(row.id)}" ${row.status === 'completed' ? '' : 'disabled'}>Verifikasi</button>
          <button class="btn btn-sm" data-action="restore" data-id="${escapeHtml(row.id)}" ${row.status === 'completed' ? '' : 'disabled'}>Restore</button>
          <button class="btn btn-sm btn-danger" data-action="delete" data-id="${escapeHtml(row.id)}">Hapus</button>
        </div>
      </td>
    </tr>`).join('')
  $('backupRows').innerHTML = rows || '<tr><td colspan="8"><div class="empty">Belum ada backup yang cocok dengan filter.</div></td></tr>'
  $('tableInfo').textContent = `${state.total} arsip · menampilkan ${state.backups.length}`
  $('prevPage').disabled = state.offset === 0
  $('nextPage').disabled = state.offset + state.limit >= state.total
}

function renderLogs() {
  const rows = state.logs
  $('logList').innerHTML = rows.length
    ? rows.map(row => `
      <div class="log-item ${row.level}">
        <time datetime="${escapeHtml(row.at)}">${escapeHtml(String(row.at).slice(11, 19))}</time>
        <span>${escapeHtml(row.message)}</span>
      </div>`).join('')
    : '<div class="empty">Tidak ada log pada filter ini.</div>'
}

function renderAudit(items) {
  $('auditList').innerHTML = items.length
    ? items.slice(0, 20).map(row => `
      <div class="log-item">
        <time>${escapeHtml(String(row.at).slice(5, 16).replace('T', ' '))}</time>
        <span><b>${escapeHtml(row.action)}</b> · ${escapeHtml(row.actor)}${row.resource ? ` · ${escapeHtml(row.resource)}` : ''} ${row.result === 'failed' ? '<span class="badge bad">gagal</span>' : ''}</span>
      </div>`).join('')
    : '<div class="empty">Belum ada aktivitas.</div>'
}

/* ------------------------------------------------------------ data */
async function loadStatus() {
  const status = await api('status')
  renderStatus(status)
  return status
}

async function loadBackups() {
  const params = new URLSearchParams({ limit: String(state.limit), offset: String(state.offset), sort: 'desc' })
  if (state.filters.status) params.set('status', state.filters.status)
  if (state.filters.q) params.set('q', state.filters.q)
  const payload = await api(`backups?${params}`)
  renderBackups(payload)
}

async function loadLogs() {
  const params = new URLSearchParams({ limit: '40' })
  if (state.logTab === 'error' || state.logTab === 'warn') params.set('level', state.logTab)
  if (['backup', 'restore'].includes(state.logTab)) params.set('type', state.logTab)
  const payload = await api(`logs?${params}`)
  state.logs = payload.items || []
  renderLogs()
}

async function loadAudit() {
  const payload = await api('audit-logs?limit=40')
  renderAudit(payload.items || [])
}

async function reload({ silent = false } = {}) {
  if (state.busy && silent) return
  try {
    await Promise.all([loadStatus(), loadBackups(), loadLogs(), loadAudit()])
  } catch (error) {
    if (!silent) toast(error.message, 'bad')
  }
}

/* ------------------------------------------------------------ actions */
async function startBackup(type) {
  setBusy(true)
  try {
    const result = await api('backups', { method: 'POST', body: { type } })
    toast(`Backup ${type} dimulai (${result.id}).`)
    await waitForBackup(result.id)
    await reload({ silent: true })
  } catch (error) {
    toast(error.message, 'bad')
  } finally {
    setBusy(false)
  }
}

async function waitForBackup(id) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    try {
      const status = await api(`backups/${id}/status`)
      if (status.status === 'completed') {
        toast(`Backup selesai · ${fmtBytes(status.sizeBytes)}`)
        return
      }
      if (status.status === 'failed') {
        toast(`Backup gagal: ${status.errorMessage || status.errorCode}`, 'bad')
        return
      }
    } catch {
      return
    }
  }
  toast('Backup masih berjalan, cek daftar beberapa saat lagi.', 'bad')
}

function setBusy(value) {
  state.busy = value
  for (const id of ['backupFull', 'backupDatabase', 'backupConfig', 'backupFiles']) $(id).disabled = value
}

function openModal({ title, text, facts = [], confirmLabel = 'Lanjutkan', tone = 'danger', token = false, onConfirm }) {
  $('modalTitle').textContent = title
  $('modalText').textContent = text
  $('modalFacts').innerHTML = facts.map(([key, value]) => `<div><span>${escapeHtml(key)}</span><span>${escapeHtml(value)}</span></div>`).join('')
  $('modalFacts').classList.toggle('hidden', !facts.length)
  $('modalTokenField').classList.toggle('hidden', !token)
  $('modalToken').value = ''
  $('modalConfirm').textContent = confirmLabel
  $('modalConfirm').className = `btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`
  $('modalBackdrop').hidden = false
  $('modalConfirm').focus()
  state.modalAction = onConfirm
}

function closeModal() {
  $('modalBackdrop').hidden = true
  state.modalAction = null
}

async function doRestore(id) {
  try {
    const plan = await api('restores', { method: 'POST', body: { backupId: id } })
    openModal({
      title: 'Konfirmasi restore',
      text: 'Restore akan menimpa data saat ini. Backup kondisi sekarang dibuat otomatis lebih dulu. Database SQLite aktif setelah bot restart.',
      facts: [
        ['Backup', plan.backupId],
        ['Cakupan', (plan.components || []).join(', ')],
        ['Berkas', `${plan.summary?.files ?? 0} (${fmtBytes(plan.summary?.bytes)} )`],
        ['Akan menimpa', `${plan.summary?.overwrites ?? 0} berkas`],
        ['Butuh restart', plan.summary?.requiresRestart ? 'ya' : 'tidak'],
      ],
      confirmLabel: 'Restore sekarang',
      token: true,
      onConfirm: async () => {
        const result = await api(`restores/${plan.id}/confirm`, { method: 'POST', body: { token: $('modalToken').value.trim() } })
        toast(result.status === 'completed' ? 'Restore selesai.' : 'Restore selesai — restart bot untuk mengaktifkan database.')
        await reload({ silent: true })
      },
    })
  } catch (error) {
    toast(error.message, 'bad')
  }
}

function doDelete(id) {
  const row = state.backups.find(item => item.id === id)
  openModal({
    title: 'Hapus arsip backup?',
    text: 'Arsip akan dihapus permanen dari server. Tindakan ini tercatat di audit log.',
    facts: [['Backup', id], ['Ukuran', fmtBytes(row?.sizeBytes)]],
    confirmLabel: 'Hapus',
    onConfirm: async () => {
      await api(`backups/${id}?confirm=1`, { method: 'DELETE' })
      toast('Backup dihapus.')
      await reload({ silent: true })
    },
  })
}

async function doDownload(id) {
  try {
    const response = await api(`backups/${id}/download`, { raw: true })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup_${id}.tar.gz`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
    toast('Unduhan dimulai.')
  } catch (error) {
    toast(error.message, 'bad')
  }
}

async function uploadArchive(file) {
  if (!file) return
  if (file.size > 200 * 1024 * 1024) {
    toast('Arsip lebih dari 200 MB.', 'bad')
    return
  }
  toast(`Mengunggah ${file.name}…`)
  try {
    const response = await fetch('/api/backup/backups/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${state.session.access_token}`, 'Content-Type': 'application/gzip' },
      body: file,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
    toast(`Arsip diunggah: ${data.backup?.id}`)
    await reload({ silent: true })
  } catch (error) {
    toast(error.message, 'bad')
  }
}

/* ------------------------------------------------------------ wiring */
function bind() {
  $('loginForm').addEventListener('submit', async event => {
    event.preventDefault()
    $('loginBtn').disabled = true
    $('loginMsg').textContent = 'Memeriksa…'
    try {
      await login($('email').value.trim(), $('password').value)
      $('loginMsg').textContent = ''
      showApp()
      await reload()
      startPolling()
    } catch (error) {
      $('loginMsg').textContent = error.message
    } finally {
      $('loginBtn').disabled = false
    }
  })

  $('logoutBtn').addEventListener('click', () => {
    saveSession(null)
    showAuth('Kamu sudah keluar.')
  })

  $('refreshBtn').addEventListener('click', () => reload())

  $('backupFull').addEventListener('click', () => startBackup('full'))
  $('backupDatabase').addEventListener('click', () => startBackup('database'))
  $('backupConfig').addEventListener('click', () => startBackup('config'))
  $('backupFiles').addEventListener('click', () => startBackup('files'))

  $('filterStatus').addEventListener('change', event => {
    state.filters.status = event.target.value
    state.offset = 0
    loadBackups().catch(error => toast(error.message, 'bad'))
  })

  let searchTimer = null
  $('searchBox').addEventListener('input', event => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      state.filters.q = event.target.value.trim()
      state.offset = 0
      loadBackups().catch(error => toast(error.message, 'bad'))
    }, 350)
  })

  $('prevPage').addEventListener('click', () => {
    state.offset = Math.max(0, state.offset - state.limit)
    loadBackups().catch(error => toast(error.message, 'bad'))
  })
  $('nextPage').addEventListener('click', () => {
    state.offset += state.limit
    loadBackups().catch(error => toast(error.message, 'bad'))
  })

  $('backupRows').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]')
    if (!button) return
    const { action, id } = button.dataset
    if (action === 'download') doDownload(id)
    else if (action === 'verify') api(`backups/${id}/verify`, { method: 'POST' }).then(result => {
      toast(result.ok ? 'Verifikasi OK.' : 'Verifikasi gagal.', result.ok ? 'ok' : 'bad')
      reload({ silent: true })
    }).catch(error => toast(error.message, 'bad'))
    else if (action === 'restore') doRestore(id)
    else if (action === 'delete') doDelete(id)
  })

  document.querySelectorAll('[data-logtab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-logtab]').forEach(other => other.setAttribute('aria-selected', 'false'))
      tab.setAttribute('aria-selected', 'true')
      state.logTab = tab.dataset.logtab
      loadLogs().catch(error => toast(error.message, 'bad'))
    })
  })

  $('toggleScheduler').addEventListener('click', async () => {
    try {
      const enabled = !(state.status?.scheduler?.enabled)
      await api(`scheduler/${enabled ? 'enable' : 'disable'}`, { method: 'POST' })
      toast(`Scheduler ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`)
      await loadStatus()
    } catch (error) {
      toast(error.message, 'bad')
    }
  })

  $('saveInterval').addEventListener('click', () => {
    const value = Number($('intervalInput').value)
    if (!Number.isFinite(value) || value < 1 || value > 1440) {
      toast('Interval harus 1–1440 menit.', 'bad')
      return
    }
    openModal({
      title: 'Ubah interval backup',
      text: `Backup otomatis akan berjalan setiap ${value} menit. Perubahan dicatat di audit log.`,
      facts: [['Interval sekarang', `${state.status?.scheduler?.intervalMinutes} menit`], ['Interval baru', `${value} menit`]],
      confirmLabel: 'Simpan',
      tone: 'primary',
      onConfirm: async () => {
        await api('scheduler', { method: 'PATCH', body: { intervalMinutes: value } })
        toast('Interval diperbarui.')
        await loadStatus()
      },
    })
  })

  $('runVerifyAll').addEventListener('click', async () => {
    const latest = state.backups.find(row => row.status === 'completed')
    if (!latest) return toast('Belum ada backup untuk diverifikasi.', 'bad')
    try {
      const result = await api(`backups/${latest.id}/verify`, { method: 'POST' })
      toast(result.ok ? `Verifikasi OK · ${result.entries} entri` : 'Verifikasi gagal.', result.ok ? 'ok' : 'bad')
      await reload({ silent: true })
    } catch (error) {
      toast(error.message, 'bad')
    }
  })

  $('uploadBtn').addEventListener('click', () => $('uploadInput').click())
  $('uploadInput').addEventListener('change', event => {
    uploadArchive(event.target.files?.[0])
    event.target.value = ''
  })

  $('modalCancel').addEventListener('click', closeModal)
  $('modalBackdrop').addEventListener('click', event => {
    if (event.target === $('modalBackdrop')) closeModal()
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('modalBackdrop').hidden) closeModal()
  })
  $('modalConfirm').addEventListener('click', async () => {
    if (!state.modalAction) return
    const action = state.modalAction
    $('modalConfirm').disabled = true
    try {
      await action()
      closeModal()
    } catch (error) {
      toast(error.message, 'bad')
    } finally {
      $('modalConfirm').disabled = false
    }
  })
}

function startPolling() {
  stopPolling()
  state.pollTimer = setInterval(() => {
    if (document.hidden) return
    if (state.busy) return
    loadStatus().catch(() => {})
    loadBackups().catch(() => {})
  }, 10000)
}

function stopPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer)
  state.pollTimer = null
}

async function boot() {
  bind()
  state.session = loadSession()
  if (!state.session) {
    showAuth()
    return
  }
  showApp()
  try {
    await reload()
    startPolling()
  } catch (error) {
    if (/401|Sesi|masuk/i.test(error.message)) showAuth(error.message)
    else toast(error.message, 'bad')
  }
}

boot()
