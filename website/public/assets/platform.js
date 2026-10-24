/* Ecosystem Console — semua data berasal dari /api/ecosystem (backend nyata).
 *
 * Alur: browser → /api/ecosystem/* → gateway Vercel (verifikasi sesi Supabase
 * + role dari database) → bot /api/platform-system/*.
 * Tidak ada angka, status, atau tombol yang dikarang di sisi klien.
 */
(() => {
  const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'
  const SUPABASE_KEY = 'sb_publishable_ebpebtzCNxvsKWb0xtgX_A_ClzPlhob'
  const STORAGE_KEY = 'umi_studio_session_v2'

  const state = { session: null, permissions: [], view: 'dashboard', slots: [], timer: null }

  const $ = selector => document.querySelector(selector)
  const $$ = selector => [...document.querySelectorAll(selector)]
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const fmt = value => Number(value || 0).toLocaleString('id-ID')
  const bytes = value => {
    const n = Number(value || 0)
    if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`
    if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`
    if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`
    return `${n} B`
  }
  const when = iso => (iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '—')

  function toast(message, bad = false) {
    const box = $('#toast')
    box.textContent = message
    box.className = `toast ${bad ? 'bad' : 'ok'}`
    box.hidden = false
    clearTimeout(toast.timer)
    toast.timer = setTimeout(() => { box.hidden = true }, 4600)
  }

  /* ------------------------------------------------------------ session */
  function saveSession(session) {
    state.session = session
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  }

  function loadSession() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (raw?.access_token) { state.session = raw; return raw }
    } catch {}
    return null
  }

  async function refreshSession() {
    if (!state.session?.refresh_token) return false
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
        body: JSON.stringify({ refresh_token: state.session.refresh_token }),
      })
      if (!response.ok) return false
      const data = await response.json()
      if (!data.access_token) return false
      saveSession({ ...state.session, ...data, user: data.user || state.session.user })
      return true
    } catch { return false }
  }

  async function api(path, { method = 'GET', body = null, retry = true } = {}) {
    const headers = { Accept: 'application/json' }
    if (body) headers['Content-Type'] = 'application/json'
    if (state.session?.access_token) headers.Authorization = `Bearer ${state.session.access_token}`
    let response
    try {
      response = await fetch(`/api/ecosystem/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
    } catch {
      throw new Error('Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.')
    }
    if (response.status === 401 && retry && state.session?.refresh_token) {
      if (await refreshSession()) return api(path, { method, body, retry: false })
      saveSession(null)
    }
    const raw = await response.text()
    let data = {}
    try { data = raw ? JSON.parse(raw) : {} } catch { data = { error: raw.slice(0, 200) } }
    if (!response.ok) throw Object.assign(new Error(data.error || `Permintaan gagal (HTTP ${response.status}).`), { status: response.status })
    return data
  }

  async function signIn(identifier, password) {
    const response = await fetch('/api/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.access_token) throw new Error(data.error || 'Email/username atau password salah.')
    saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in || 3600,
      user: data.user || null,
    })
  }

  async function boot() {
    loadSession()
    if (!state.session?.access_token) return showLogin()
    try {
      const session = await api('session')
      state.permissions = session.permissions || []
      $('#loginView').hidden = true
      $('#appViews').hidden = false
      renderIdentity(session)
      await navigate(state.view)
      startAutoRefresh()
    } catch (error) {
      if (error.status === 401) return showLogin('Sesi berakhir. Silakan masuk lagi.')
      $('#loginView').hidden = true
      $('#appViews').hidden = false
      toast(error.message, true)
    }
  }

  function startAutoRefresh() {
    clearInterval(state.timer)
    state.timer = setInterval(() => {
      if (document.hidden) return
      if (['dashboard', 'servers', 'telegram'].includes(state.view)) navigate(state.view, { silent: true })
    }, 30000)
  }

  function showLogin(message = '') {
    $('#loginView').hidden = false
    $('#appViews').hidden = true
    $('#loginError')?.remove()
    if (message) {
      const el = document.createElement('p')
      el.id = 'loginError'
      el.className = 'error-box'
      el.textContent = message
      $('#loginForm').prepend(el)
    }
  }

  function can(permission) { return state.permissions.includes(permission) }

  const NAV_PERMISSION = {
    // Semua pengguna boleh membuka Telegram untuk bot miliknya sendiri;
    // isi tabel dibatasi backend (scope 'own').
    telegram: 'telegram.own',
    mainbot: 'mainbot.manage',
    premium: 'premium.manage',
    servers: 'server.read',
    users: 'platform.users.read',
    audit: 'platform.audit.read',
    media: 'media.upload',
    rpg: 'rpg.read',
    saham: 'stock.read',
    reseller: 'reseller.read',
    link: 'session.own',
    dashboard: 'session.own',
  }

  function renderIdentity(session) {
    const user = session.user || {}
    const name = user.displayName || (user.email ? user.email.split('@')[0] : 'akun')
    $('#userName').textContent = name
    $('#userRole').textContent = user.role || 'user'
    $('#userAvatar').textContent = (name[0] || '·').toUpperCase()
    $$('.nav-item').forEach(item => { item.hidden = !can(NAV_PERMISSION[item.dataset.view] || 'session.own') })
  }

  /* ------------------------------------------------------------ routing */
  const TITLES = {
    dashboard: ['Ringkasan', 'Satu backend, satu sumber data, dua antarmuka.'],
    telegram: ['Telegram', 'Konfigurasi bot, validasi token, dan status koneksi.'],
    mainbot: ['Bot Utama', 'Nomor bebas (nomor biasa boleh) asal pairing di bot utama. Khusus owner.'],
    premium: ['Premium', 'Saklar mode premium platform. Khusus owner/developer.'],
    servers: ['Server', 'Maksimum 10 slot. Slot kosong tidak dipantau.'],
    rpg: ['RPG', 'Profil dan papan peringkat dari mesin RPG yang sama dengan WhatsApp.'],
    saham: ['Saham', 'Pasar dari service website yang sama — tanpa harga karangan.'],
    users: ['Pengguna', 'Peran disimpan di database dan diverifikasi backend.'],
    audit: ['Audit', 'Semua aksi sensitif tercatat tanpa rahasia.'],
    media: ['Media → URL', 'Tautan bertanda tangan dari media yang benar-benar tersimpan.'],
    link: ['Tautkan Telegram', 'Kode sekali pakai, berlaku 10 menit.'],
    reseller: ['Reseller', 'Hanya menampilkan data yang benar-benar ada di backend.'],
  }

  async function navigate(view, { silent = false } = {}) {
    if (!can(NAV_PERMISSION[view] || 'session.own')) view = 'dashboard'
    if (view === state.view && !silent) {
      // tetap muat ulang data saat pengguna menekan menu yang sama
    }
    state.view = view
    $$('.nav-item').forEach(item => item.classList.toggle('is-active', item.dataset.view === view))
    $$('.view[data-view]').forEach(section => { section.hidden = section.dataset.view !== view })
    const [title, sub] = TITLES[view] || ['Console', '']
    $('#pageTitle').textContent = title
    $('#pageSub').textContent = sub
    try {
      if (view === 'dashboard') await loadDashboard()
      if (view === 'telegram') await loadBots()
      if (view === 'mainbot') await loadMainBot()
      if (view === 'premium') await loadPremium()
      if (view === 'servers') await loadServers()
      if (view === 'rpg') await loadRpg()
      if (view === 'saham') await loadSaham()
      if (view === 'users') await loadUsers()
      if (view === 'audit') await loadAudit()
      if (view === 'media') await loadMedia()
      if (view === 'link') await loadLink()
      if (view === 'reseller') await loadReseller()
    } catch (error) {
      if (error.status === 401) return showLogin('Sesi berakhir. Silakan masuk lagi.')
      toast(error.message, true)
    }
  }

  /* ------------------------------------------------------------ dashboard */
  async function loadDashboard() {
    const data = await api('dashboard')
    state.slots = data.servers?.slots || []
    const wa = data.whatsapp || {}
    const tg = data.telegram || {}
    const running = (tg.adapters || []).filter(item => item.running).length

    $('#connPill').className = `pill ${wa.connected ? 'ok' : 'warn'}`
    $('#connText').textContent = wa.connected ? 'WhatsApp terhubung' : `WhatsApp ${wa.connection || 'belum terhubung'}`

    const stats = [
      { label: 'WhatsApp', value: wa.connected ? 'Online' : 'Offline', sub: `${fmt(wa.sessions)} sesi jadibot` },
      { label: 'Telegram', value: `${fmt(running)} poller`, sub: `${fmt(data.counts?.bots)} bot terdaftar` },
      { label: 'Server', value: `${fmt(data.servers?.configured)}/${fmt(data.servers?.max)}`, sub: 'slot terkonfigurasi' },
      { label: 'Pengguna', value: fmt(data.counts?.users), sub: `${fmt(data.counts?.identities)} identitas` },
      { label: 'Media', value: fmt(data.counts?.media), sub: 'berkas aktif' },
      { label: 'Audit 24 jam', value: fmt(data.counts?.auditToday), sub: 'event tercatat' },
    ]
    $('#statGrid').innerHTML = stats.map(item => `
      <article class="stat">
        <div class="label">${esc(item.label)}</div>
        <div class="value">${esc(item.value)}</div>
        <div class="sub">${esc(item.sub)}</div>
      </article>`).join('')

    const services = [
      {
        name: 'Mesin RPG',
        ok: Boolean(data.rpg?.active),
        detail: data.rpg?.active ? `${fmt(data.rpg.canonicalUsers)} profil · ${fmt(data.rpg.verifiedAliases)} alias` : 'belum aktif',
      },
      { name: 'API saham', ok: Boolean(data.stock?.ready), detail: data.stock?.ready ? 'token game tersedia' : 'token game tidak ditemukan' },
      ...(data.health || []).map(item => ({ name: item.name, ok: item.status === 'ok', detail: item.detail || item.status })),
    ]
    $('#serviceList').innerHTML = services.map(item => `
      <div class="row">
        <div><strong>${esc(item.name)}</strong><br><small>${esc(item.detail)}</small></div>
        <span class="badge ${item.ok ? 'ok' : 'warn'}">${item.ok ? 'siap' : 'periksa'}</span>
      </div>`).join('') || '<div class="empty">Belum ada data kesehatan integrasi.</div>'
    $('#statTime').textContent = `Diperiksa ${when(new Date().toISOString())}`

    $('#recentAudit').innerHTML = (data.recentAudit || []).length
      ? data.recentAudit.map(item => `
        <div class="item">
          <time>${when(item.at)}</time>
          <div class="what"><strong>${esc(item.action)}</strong> <span class="muted">${esc(item.resource || '')}</span></div>
        </div>`).join('')
      : '<div class="empty">Belum ada aktivitas.</div>'

    const configured = state.slots.filter(slot => slot.configured)
    $('#slotMeta').textContent = `${configured.length} aktif · ${state.slots.length - configured.length} kosong`
    $('#slotSummary').innerHTML = configured.map(slot => `
      <div class="row"><div><strong>${esc(slot.name || `Server ${slot.slot}`)}</strong><br><small>${esc(slot.host)}</small></div><span class="badge info">slot ${slot.slot}</span></div>
    `).join('') || '<div class="empty">Belum ada slot server yang dikonfigurasi.</div>'

    $('#botSummary').innerHTML = (tg.bots || []).map(bot => `
      <div class="row"><div><strong>${esc(bot.label)}</strong><br><small>@${esc(bot.username || '—')}</small></div>
      <span class="badge ${bot.enabled ? 'ok' : ''}">${esc(bot.status)}</span></div>
    `).join('') || '<div class="empty">Belum ada bot Telegram.</div>'
  }

  /* ------------------------------------------------------------ telegram */
  /* Kolom "Bot WhatsApp": hubungkan bot Telegram ini ke bot WhatsApp milik
     akun yang sedang masuk. Nomor diambil dari sesi jadibot akun itu sendiri,
     jadi pengguna tidak bisa mengetik nomor milik orang lain. */
  function waLinkCell(bot) {
    if (bot.linked) {
      return `<span class="badge ${bot.waOnline ? 'ok' : 'warn'}">${bot.waOnline ? 'online' : 'offline'}</span><br>
        <small class="mono">${esc(bot.waNumber || '—')}</small>
        <div><button class="btn btn-sm btn-ghost" data-link="${esc(bot.id)}" data-number="">Lepas</button></div>`
    }
    const sessions = state.botSessions || []
    if (sessions.length) {
      return `<select data-linkpick="${esc(bot.id)}">
          <option value="">pilih bot WhatsApp…</option>
          ${sessions.map(item => `<option value="${esc(item.number)}">${esc(item.masked || item.number)}</option>`).join('')}
        </select>
        <div><button class="btn btn-sm" data-link="${esc(bot.id)}" data-pick="1">Hubungkan</button></div>`
    }
    return `<input data-linkpick="${esc(bot.id)}" placeholder="62xxxxxxxxxx" inputmode="numeric" maxlength="15">
      <div><button class="btn btn-sm" data-link="${esc(bot.id)}" data-pick="1">Hubungkan</button></div>
      <small class="muted">Belum ada bot WhatsApp aktif di akun ini.</small>`
  }

  async function loadBots() {
    const data = await api('telegram/bots')
    const bots = data.items || []
    state.botSessions = data.sessions || []
    if (!bots.length) {
      $('#botTable').innerHTML = '<div class="empty">Belum ada bot. Tambahkan token dari BotFather untuk memulai.</div>'
      return
    }
    $('#botTable').innerHTML = `
      <table>
        <thead><tr><th>Bot</th><th>Status</th><th>Mode</th><th>Bot WhatsApp</th><th>Token</th><th>Diperbarui</th><th>Aksi</th></tr></thead>
        <tbody>${bots.map(bot => `
          <tr>
            <td><strong>${esc(bot.label)}</strong><br><small class="mono">@${esc(bot.username || '—')} · ${esc(bot.botId || '—')}</small></td>
            <td><span class="badge ${bot.status === 'online' ? 'ok' : ['error', 'revoked', 'unauthorized'].includes(bot.status) ? 'bad' : 'warn'}">${esc(bot.status)}</span>
              ${bot.lastError ? `<br><small class="muted">${esc(bot.lastError).slice(0, 70)}</small>` : ''}</td>
            <td>${esc(bot.mode)}${bot.enabled ? ' · aktif' : ' · nonaktif'}</td>
            <td>${waLinkCell(bot)}</td>
            <td><small class="mono">${esc(bot.tokenMasked || '—')}</small></td>
            <td><small>${when(bot.updatedAt)}</small></td>
            <td class="actions">
              <button class="btn btn-sm" data-bot="${esc(bot.id)}" data-act="validate">Validasi</button>
              <button class="btn btn-sm" data-bot="${esc(bot.id)}" data-act="${bot.enabled ? 'disable' : 'enable'}">${bot.enabled ? 'Nonaktifkan' : 'Aktifkan'}</button>
              <button class="btn btn-sm btn-danger" data-bot="${esc(bot.id)}" data-act="revoke">Cabut</button>
            </td>
          </tr>`).join('')}</tbody>
      </table>`
  }

  async function linkBot(id, number) {
    const result = await api(`telegram/bots/${id}/link`, { method: 'POST', body: { number } })
    toast(result.bot?.linked ? `Bot dihubungkan ke ${result.bot.waNumber}.` : 'Sambungan bot WhatsApp dilepas.')
    await loadBots()
  }

  /* ------------------------------------------------------------ bot utama */
  async function loadMainBot() {
    const data = await api('main-bot')
    const badge = { connected: 'ok', registered: 'ok', pairing: 'warn', unpaired: 'bad' }[data.status] || 'warn'
    $('#mainBotStatus').innerHTML = `
      <dl class="kv">
        <dt>Status</dt><dd><span class="badge ${badge}">${esc(data.status)}</span></dd>
        <dt>Nomor tersimpan</dt><dd><span class="mono">${esc(data.pairing_number_masked || '—')}</span></dd>
        <dt>Socket siap</dt><dd>${data.socket_ready ? 'ya' : 'belum'}</dd>
        <dt>Pairing aktif</dt><dd>${data.pairing_active ? 'ya — kirim kode dari WhatsApp' : 'tidak'}</dd>
        <dt>Runtime</dt><dd>${data.runtimeReady ? 'siap menerima nomor' : 'belum siap'}</dd>
      </dl>
      ${data.pairing_code ? `<p>Kode pairing: <b class="mono" style="font-size:20px;letter-spacing:2px">${esc(data.pairing_code)}</b></p>` : ''}
      ${data.pairing_active ? '<p class="muted">Buka WhatsApp di nomor itu → Perangkat tertaut → Tautkan perangkat → <b>Tautkan dengan nomor telepon</b>, lalu masukkan kode di atas (juga tercetak di konsol panel). Kode berlaku beberapa menit; kalau kedaluwarsa, simpan nomor lagi.</p>' : ''}
      ${!data.runtimeReady ? '<p class="muted">Runtime pairing belum siap. Coba muat ulang halaman ini beberapa saat lagi.</p>' : ''}`
    const form = $('#mainBotForm')
    if (form) form.elements.number.value = ''
  }

  /* ------------------------------------------------------------ premium */
  async function loadPremium() {
    const data = await api('premium-mode')
    const on = data.enabled !== false
    $('#premiumStatus').innerHTML = `
      <dl class="kv">
        <dt>Status</dt><dd><span class="badge ${on ? 'ok' : 'bad'}">${on ? 'ON — fitur premium aktif' : 'OFF — semua fitur gratis'}</span></dd>
        <dt>Diubah</dt><dd>${data.updatedAt ? esc(when(data.updatedAt)) : '—'}</dd>
        <dt>Oleh</dt><dd>${esc(data.updatedBy || '—')}</dd>
        <dt>Katalog plugin</dt><dd>${fmt(data.catalogPlugins || 0)}</dd>
        <dt>Sesi bot</dt><dd>${fmt(data.sessions || 0)}</dd>
      </dl>
      <p class="muted">${on
        ? 'Pemilik bot masih bisa mematikan mode premium khusus bot miliknya, dan memilih fitur premium lewat Settings atau <code>.premium</code>.'
        : 'Seluruh fitur premium sekarang gratis di semua bot. Nyalakan lagi untuk mengaktifkan kembali pembatasan premium.'}</p>`
    const button = $('#togglePremium')
    button.dataset.enabled = on ? '1' : '0'
    button.textContent = on ? 'MATIKAN MODE PREMIUM' : 'NYALAKAN MODE PREMIUM'
    button.className = `btn ${on ? 'btn-danger' : 'btn-primary'}`
  }

  async function botAction(id, action) {
    if (action === 'revoke' && !(await confirmDialog('Cabut bot ini?', 'Token dihapus permanen dari database dan bot berhenti sampai token baru disimpan.'))) return
    const result = await api(`telegram/bots/${id}/${action}`, { method: 'POST' })
    if (action === 'validate') {
      const bot = result.bot || {}
      toast(`Validasi berhasil: @${bot.username || '—'}`)
    } else if (action === 'enable') {
      toast('Bot diaktifkan di database. Poller mulai pada proses bot berikutnya / reload berikut.')
    } else if (action === 'disable') {
      toast('Bot dinonaktifkan. Poller berhenti pada siklus berikut.')
    } else {
      toast('Bot dicabut.')
    }
    await loadBots()
    return result
  }

  /* ------------------------------------------------------------ servers */
  async function loadServers() {
    const data = await api('servers')
    const slots = data.slots || []
    state.slots = slots
    $('#serverTable').innerHTML = `
      <table>
        <thead><tr><th>Slot</th><th>Nama</th><th>Host</th><th>Credential ref</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>${slots.map(slot => `
          <tr>
            <td><strong>${slot.slot}</strong></td>
            <td>${slot.configured ? esc(slot.name || '—') : '<span class="muted">kosong</span>'}</td>
            <td>${slot.configured ? `<span class="mono">${esc(slot.host)}</span>` : '—'}</td>
            <td>${slot.configured ? `<span class="mono">${esc(slot.credentialRef)}</span>` : '—'}</td>
            <td><span class="badge ${slot.configured ? (slot.enabled ? 'ok' : 'warn') : ''}">${slot.configured ? (slot.enabled ? 'aktif' : 'nonaktif') : 'tidak ada'}</span></td>
            <td class="actions">
              <button class="btn btn-sm" data-slot="${slot.slot}" data-act="edit">${slot.configured ? 'Ubah' : 'Isi'}</button>
              ${slot.configured ? `<button class="btn btn-sm" data-slot="${slot.slot}" data-act="status">Cek status</button>` : ''}
              ${slot.configured ? `<button class="btn btn-sm btn-danger" data-slot="${slot.slot}" data-act="delete">Hapus</button>` : ''}
            </td>
          </tr>`).join('')}</tbody>
      </table>
      <form id="slotForm" class="form form-grid" hidden>
        <input type="hidden" name="slot">
        <label>Nama<input name="name" maxlength="80" placeholder="Bot Utama"></label>
        <label>Host panel (HTTPS)<input name="host" placeholder="https://panel.example" required></label>
        <label>Nama env kredensial<input name="credentialRef" placeholder="PANEL_KEY_UTAMA" required></label>
        <label>Server ID di panel<input name="panelServerId" placeholder="d178bf71" required></label>
        <label class="inline"><input type="checkbox" name="enabled"> Slot aktif &amp; dipantau</label>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Simpan slot</button>
          <button class="btn btn-ghost" type="button" id="cancelSlotForm">Batal</button>
        </div>
      </form>`
  }

  function openSlotForm(slot) {
    const form = $('#slotForm')
    if (!form) return
    form.hidden = false
    form.elements.slot.value = slot?.slot || ''
    form.elements.name.value = slot?.name || ''
    form.elements.host.value = slot?.host || ''
    form.elements.credentialRef.value = slot?.credentialRef || ''
    form.elements.panelServerId.value = slot?.panelServerId || ''
    form.elements.enabled.checked = Boolean(slot?.enabled)
    form.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function showServerStatus(slot) {
    const card = $('#serverDetailCard')
    const box = $('#serverDetail')
    $('#serverDetailTitle').textContent = `Server slot ${slot}`
    box.innerHTML = '<div class="muted">memeriksa panel…</div>'
    card.hidden = false
    try {
      const data = await api(`servers/${slot}/action`, { method: 'POST', body: { action: 'status' } })
      const status = data.result || {}
      const usage = status.usage || {}
      box.innerHTML = `
        <div class="kv">
          <dt>Status</dt><dd><span class="badge ${status.online ? 'ok' : status.configured === false ? '' : 'bad'}">${esc(status.status)}</span></dd>
          <dt>Nama</dt><dd>${esc(status.name || '—')}</dd>
          <dt>Latensi</dt><dd>${status.latencyMs !== undefined ? `${fmt(status.latencyMs)} ms` : '—'}</dd>
          <dt>CPU</dt><dd>${usage.cpuPercent !== undefined ? `${Number(usage.cpuPercent).toFixed(1)}%` : '—'}</dd>
          <dt>RAM</dt><dd>${usage.memoryBytes !== undefined ? bytes(usage.memoryBytes) : '—'}</dd>
          <dt>Disk</dt><dd>${usage.diskBytes !== undefined ? bytes(usage.diskBytes) : '—'}</dd>
          <dt>Uptime</dt><dd>${usage.uptimeMs ? `${Math.floor(usage.uptimeMs / 3600000)} jam` : '—'}</dd>
          <dt>Sumber</dt><dd><span class="mono">${esc(status.source || '—')}</span></dd>
          <dt>Diperiksa</dt><dd>${when(status.checkedAt)}</dd>
          ${status.message ? `<dt>Catatan</dt><dd>${esc(status.message)}</dd>` : ''}
        </div>
        ${can('server.control') ? `<div class="form-actions" style="margin-top:14px">
          <button class="btn btn-sm" data-power="${slot}" data-signal="start">Start</button>
          <button class="btn btn-sm" data-power="${slot}" data-signal="restart">Restart</button>
          <button class="btn btn-sm btn-danger" data-power="${slot}" data-signal="stop">Stop</button>
        </div>` : '<p class="hint">Peran kamu hanya bisa melihat status, bukan mengirim perintah daya.</p>'}
        ${can('server.logs') ? `<div class="form-actions" style="margin-top:10px">
          <button class="btn btn-sm btn-ghost" data-logs="${slot}">Ambil log (100 baris)</button>
        </div><pre class="log-box" id="logBox" hidden></pre>` : ''}`
    } catch (error) {
      box.innerHTML = `<div class="error-box">${esc(error.message)}</div>`
    }
  }

  /* ------------------------------------------------------------ rpg */
  async function loadRpg() {
    const data = await api('rpg/summary')
    const rpg = data.rpg || {}
    $('#rpgMeta').textContent = rpg.active ? 'mesin aktif' : 'mesin tidak aktif'
    if (!data.linked || !data.profile?.hasProfile) {
      $('#rpgProfile').innerHTML = `<div class="empty">
        <p><strong>${data.linked ? 'Belum ada progres RPG untuk nomor ini.' : 'Akun WhatsApp belum tertaut.'}</strong></p>
        <p class="muted">${data.linked
          ? 'Main lewat bot WhatsApp dulu, lalu muat ulang halaman ini.'
          : 'Buka menu Tautkan Telegram, ikuti kodenya, lalu main RPG lewat WhatsApp.'}</p>
      </div>`
    } else {
      const p = data.profile
      $('#rpgProfile').innerHTML = `
        <div class="kv">
          <dt>Nomor</dt><dd><span class="mono">${esc(p.jid || data.jid || '')}</span></dd>
          <dt>Level</dt><dd>${fmt(p.level)}</dd>
          <dt>EXP</dt><dd>${fmt(p.exp)}</dd>
          <dt>Koin</dt><dd>${fmt(p.koin)}</dd>
          <dt>Inventori</dt><dd>${fmt(p.inventoryCount)} jenis · ${fmt(p.totalItems)} item</dd>
        </div>`
    }
    const board = data.leaderboard || []
    $('#rpgBoard').innerHTML = board.length
      ? board.map((row, index) => `<div class="row"><div><strong>#${index + 1} ${esc(row.name || row.username || '—')}</strong><br><small>level ${fmt(row.level)}</small></div><span class="badge info">${fmt(row.koin)} koin</span></div>`).join('')
      : '<div class="empty">Papan peringkat belum tersedia.</div>'
  }

  /* ------------------------------------------------------------ saham */
  async function loadSaham() {
    const data = await api('stock/status')
    if (data.ok === false) {
      $('#stockMeta').textContent = 'tidak siap'
      $('#stockTable').innerHTML = `<div class="error-box">${esc(data.error || 'Service saham belum siap.')}${data.ready === false ? ' — token game belum ada di server.' : ''}</div>`
      return
    }
    const stocks = data.stocks || []
    $('#stockMeta').textContent = `${DataCount(stocks.length)} emiten · ${data.session ? (data.session.open ? 'sesi buka' : 'sesi tutup') : 'sesi tidak diketahui'}`
    $('#stockTable').innerHTML = stocks.length ? `
      <table>
        <thead><tr><th>Kode</th><th>Harga</th><th>Perubahan</th><th>%</th></tr></thead>
        <tbody>${stocks.slice(0, 60).map(item => `
          <tr>
            <td><strong>${esc(item.symbol)}</strong>${item.name ? `<br><small>${esc(item.name)}</small>` : ''}</td>
            <td class="mono">${fmt(item.price)}</td>
            <td class="mono ${Number(item.change) >= 0 ? '' : 'neg'}">${Number(item.change) >= 0 ? '+' : ''}${fmt(item.change)}</td>
            <td><span class="badge ${Number(item.changePercent) >= 0 ? 'ok' : 'bad'}">${Number(item.changePercent).toFixed(2)}%</span></td>
          </tr>`).join('')}</tbody>
      </table>` : '<div class="empty">API tidak mengembalikan emiten.</div>'
  }

  function DataCount(n) { return Number(n || 0).toLocaleString('id-ID') }

  /* ------------------------------------------------------------ users */
  async function loadUsers() {
    const data = await api('users?limit=50')
    $('#userMeta').textContent = `${fmt(data.total)} pengguna`
    if (!data.items?.length) {
      $('#userTable').innerHTML = '<div class="empty">Belum ada pengguna.</div>'
      return
    }
    const roles = ['user', 'reseller', 'admin', 'developer', 'owner']
    const canManage = can('platform.roles.manage')
    $('#userTable').innerHTML = `
      <table>
        <thead><tr><th>Pengguna</th><th>Peran</th><th>Identitas</th><th>Dibuat</th><th>Aksi</th></tr></thead>
        <tbody>${data.items.map(user => `
          <tr>
            <td><strong>${esc(user.displayName || user.email || user.id)}</strong><br><small class="mono">${esc(user.id)}</small></td>
            <td><span class="badge info">${esc(user.role)}</span></td>
            <td>${fmt(user.identities)}</td>
            <td><small>${when(user.createdAt)}</small></td>
            <td class="actions">
              ${canManage ? `<select class="input-sm" data-role-user="${esc(user.id)}">
                ${roles.map(role => `<option value="${role}" ${role === user.role ? 'selected' : ''}>${role}</option>`).join('')}
              </select><button class="btn btn-sm" data-save-role="${esc(user.id)}">Simpan</button>` : '<span class="muted">—</span>'}
            </td>
          </tr>`).join('')}</tbody>
      </table>`
  }

  /* ------------------------------------------------------------ audit */
  async function loadAudit() {
    const filter = $('#auditFilter').value.trim()
    const data = await api(`audit?limit=80${filter ? `&action=${encodeURIComponent(filter)}` : ''}`)
    if (!data.items?.length) {
      $('#auditTable').innerHTML = '<div class="empty">Tidak ada event untuk filter ini.</div>'
      return
    }
    $('#auditTable').innerHTML = `
      <table>
        <thead><tr><th>Waktu</th><th>Aksi</th><th>Aktor</th><th>Resource</th><th>Hasil</th></tr></thead>
        <tbody>${data.items.map(item => `
          <tr>
            <td><small>${when(item.at)}</small></td>
            <td><strong>${esc(item.action)}</strong></td>
            <td><small class="mono">${esc(item.actorUserId || '—')}</small></td>
            <td><small>${esc(item.resource || '—')}</small></td>
            <td><span class="badge ${item.result === 'ok' ? 'ok' : item.result === 'denied' ? 'warn' : 'bad'}">${esc(item.result)}</span></td>
          </tr>`).join('')}</tbody>
      </table>`
  }

  /* ------------------------------------------------------------ media */
  async function loadMedia() {
    const data = await api('media?limit=50')
    const items = data.items || []
    $('#mediaMeta').textContent = `${fmt(items.length)} berkas milik akun ini`
    if (!items.length) {
      $('#mediaTable').innerHTML = `<div class="empty">
        <p><strong>Belum ada media.</strong></p>
        <p class="muted">Kirim foto, video, atau dokumen ke bot Telegram — bot membalas dengan tautan bertanda tangan.
        Dari WhatsApp, gunakan <span class="mono">/to-url</span> dengan media yang di-reply.</p>
      </div>`
      return
    }
    $('#mediaTable').innerHTML = `
      <table>
        <thead><tr><th>Berkas</th><th>Tipe</th><th>Ukuran</th><th>Disimpan</th><th>Kedaluwarsa</th><th>Aksi</th></tr></thead>
        <tbody>${items.map(item => `
          <tr>
            <td><strong>${esc(item.name || item.id)}</strong><br><small class="mono">${esc(item.id)}</small></td>
            <td><span class="badge">${esc(item.mime)}</span></td>
            <td>${bytes(item.bytes)}</td>
            <td><small>${when(item.createdAt)}</small></td>
            <td>${item.permanent || !item.expiresAt ? '<span class="badge ok">permanen</span>' : `<small>${when(item.expiresAt)}</small>`}</td>
            <td class="actions">
              <button class="btn btn-sm" data-link="${esc(item.id)}">Buat tautan</button>
              <button class="btn btn-sm btn-danger" data-media="${esc(item.id)}">Hapus</button>
            </td>
          </tr>`).join('')}</tbody>
      </table>
      <div id="linkOut"></div>`
  }

  async function createMediaLink(id) {
    const data = await api(`media/${id}/link`, { method: 'POST' })
    const box = $('#linkOut')
    box.innerHTML = `<div class="code-box" style="margin-top:12px;font-size:12px;letter-spacing:0">
      <a href="${esc(data.url)}" target="_blank" rel="noopener noreferrer">${esc(data.url)}</a></div>
      <p class="hint">${data.permanent ? 'Tautan <b>permanen</b> — tidak kedaluwarsa.' : `Berlaku sampai ${when(data.expiresAt)}.`} Tautan bertanda tangan dan terikat ke akun ini.</p>`
    try {
      await navigator.clipboard.writeText(data.url)
      toast('Tautan disalin ke clipboard.')
    } catch {
      toast('Tautan dibuat. Salin manual dari kotak tautan.')
    }
  }

  /* ------------------------------------------------------------ link */
  async function loadLink() {
    const session = await api('session')
    const numbers = session.whatsapp?.numbers || []
    $('#linkBox').innerHTML = '<button class="btn btn-primary" id="createLinkBtn" type="button">Buat kode tautan</button>'
    $('#linkInfo').innerHTML = `
      <dt>Akun</dt><dd>${esc(session.user?.email || session.user?.id || '—')}</dd>
      <dt>Telegram</dt><dd>${session.telegramLinked ? '<span class="badge ok">tertaut</span>' : '<span class="badge warn">belum tertaut</span>'}</dd>
      <dt>Nomor WhatsApp</dt><dd>${numbers.length
        ? numbers.map(row => `<span class="mono">${esc(row.number)}</span>`).join(', ')
        : '<span class="muted">belum ada sesi jadibot atas nama akun ini</span>'}</dd>`
  }

  async function createLink() {
    const data = await api('link/telegram', { method: 'POST' })
    $('#linkBox').innerHTML = `<div class="code-box">${esc(data.code)}</div>
      <button class="btn btn-sm" id="copyLink" type="button">Salin kode</button>`
    $('#copyLink').onclick = async () => {
      try { await navigator.clipboard.writeText(data.code); toast('Kode disalin.') } catch { toast(`Salin manual: ${data.code}`, true) }
    }
    toast(`Kode dibuat. Kirim "/link ${data.code}" ke bot Telegram.`)
  }

  /* ------------------------------------------------------------ reseller */
  async function loadReseller() {
    const data = await api('dashboard')
    $('#resellerMeta').textContent = `${fmt(data.counts?.users)} akun platform`
    $('#resellerBody').innerHTML = `
      <div class="empty">
        <p><strong>Belum ada tabel pelanggan/komisi reseller di backend.</strong></p>
        <p class="muted">Panel ini sengaja tidak menampilkan angka karangan. Yang tersedia saat ini: ringkasan ekosistem
        (jumlah akun, bot, server, media) dan audit aksi. Fitur reseller penuh butuh modul data tersendiri.</p>
        <p><a class="link" href="/dashboard">Buka dashboard wallet website →</a></p>
      </div>`
  }

  /* ------------------------------------------------------------ power + logs */
  async function serverPower(slot, signal) {
    const label = { start: 'menyalakan', restart: 'restart', stop: 'menghentikan' }[signal] || signal
    if (!(await confirmDialog(`Konfirmasi ${signal}`, `Panel akan ${label} server pada slot ${slot}. Aksi ini dicatat di audit.`))) return
    await api(`servers/${slot}/action`, { method: 'POST', body: { action: signal, confirm: true } })
    toast(`Perintah ${signal} terkirim ke panel.`)
    await showServerStatus(slot)
  }

  async function serverLogs(slot) {
    const box = $('#logBox')
    if (!box) return
    box.hidden = false
    box.textContent = 'mengambil log…'
    try {
      const data = await api(`servers/${slot}/action`, { method: 'POST', body: { action: 'logs' } })
      const lines = data.result?.lines || []
      box.textContent = lines.length ? lines.join('\n') : '(log kosong)'
    } catch (error) {
      box.textContent = `Gagal mengambil log: ${error.message}`
    }
  }

  /* ------------------------------------------------------------ confirm */
  function confirmDialog(title, text) {
    const dialog = $('#confirmDialog')
    $('#confirmTitle').textContent = title
    $('#confirmText').textContent = text
    return new Promise(resolve => {
      const handler = () => { dialog.removeEventListener('close', handler); resolve(dialog.returnValue === 'yes') }
      dialog.addEventListener('close', handler)
      dialog.showModal()
    })
  }

  /* ------------------------------------------------------------ events */
  function bind() {
    $$('.nav-item').forEach(item => item.addEventListener('click', () => navigate(item.dataset.view)))
    $$('[data-jump]').forEach(item => item.addEventListener('click', event => { event.preventDefault(); navigate(item.dataset.jump) }))
    $('#refreshBtn').addEventListener('click', () => navigate(state.view))
    $('#logoutBtn').addEventListener('click', () => {
      saveSession(null)
      location.href = '/dashboard'
    })

    $('#loginForm').addEventListener('submit', async event => {
      event.preventDefault()
      const form = event.currentTarget
      const button = form.querySelector('button[type="submit"]')
      button.disabled = true
      try {
        await signIn(form.elements.identifier.value.trim(), form.elements.password.value)
        await boot()
        toast('Masuk.')
      } catch (error) {
        showLogin(error.message)
      } finally { button.disabled = false }
    })

    $('#openBotForm').addEventListener('click', () => { $('#botForm').hidden = false })
    $('#cancelBotForm').addEventListener('click', () => { $('#botForm').hidden = true; $('#botForm').reset() })
    $('#botForm').addEventListener('submit', async event => {
      event.preventDefault()
      const form = event.currentTarget
      const button = form.querySelector('button[type="submit"]')
      button.disabled = true
      button.textContent = 'Memvalidasi…'
      try {
        await api('telegram/bots', {
          method: 'POST',
          body: {
            label: form.elements.label.value.trim(),
            token: form.elements.token.value.trim(),
            enabled: form.elements.enabled.checked,
            mode: 'polling',
          },
        })
        form.reset()
        form.hidden = true
        toast('Token tervalidasi lewat getMe dan tersimpan terenkripsi.')
        await loadBots()
      } catch (error) {
        toast(error.message, true)
      } finally {
        button.disabled = false
        button.textContent = 'Validasi & simpan'
      }
    })

    $('#botTable').addEventListener('click', async event => {
      // Hubungkan / lepas bot WhatsApp milik akun ini.
      const linker = event.target.closest('[data-link]')
      if (linker) {
        const id = linker.dataset.link
        let number = linker.dataset.number ?? ''
        if (linker.dataset.pick === '1') {
          const field = document.querySelector(`[data-linkpick="${id}"]`)
          number = String(field?.value || '').replace(/\D/g, '')
          if (!number) return toast('Pilih atau isi nomor bot WhatsApp dulu.', true)
        } else if (!(await confirmDialog('Lepas sambungan bot WhatsApp?', 'Bot Telegram tetap hidup, hanya tautannya yang dihapus.'))) {
          return
        }
        linker.disabled = true
        try { await linkBot(id, number) } catch (error) { toast(error.message, true) } finally { linker.disabled = false }
        return
      }
      const button = event.target.closest('[data-bot]')
      if (!button) return
      button.disabled = true
      try { await botAction(button.dataset.bot, button.dataset.act) } catch (error) { toast(error.message, true) } finally { button.disabled = false }
    })

    // Nomor bot utama: nomor biasa boleh, pairing dilakukan di bot utama.
    const mainForm = $('#mainBotForm')
    if (mainForm) {
      mainForm.addEventListener('submit', async event => {
        event.preventDefault()
        const form = event.currentTarget
        const button = form.querySelector('button[type="submit"]')
        const number = String(form.elements.number.value || '').replace(/\D/g, '')
        if (number.length < 8) return toast('Nomor terlalu pendek.', true)
        button.disabled = true
        button.textContent = 'Menyimpan…'
        try {
          const result = await api('main-bot/number', { method: 'POST', body: { number } })
          toast(`Nomor disimpan (${result.pairing_number_masked || '—'}). Pairing dimulai.`)
          await loadMainBot()
        } catch (error) {
          toast(error.message, true)
        } finally {
          button.disabled = false
          button.textContent = 'Simpan & pairing'
        }
      })
    }

    $('#serverTable').addEventListener('click', async event => {
      if (event.target.closest('#cancelSlotForm')) { $('#slotForm').hidden = true; return }
      const button = event.target.closest('[data-slot]')
      if (!button) return
      const slot = Number(button.dataset.slot)
      const action = button.dataset.act
      const slotData = state.slots.find(item => item.slot === slot)
      if (action === 'edit') return openSlotForm(slotData || { slot })
      if (action === 'status') return showServerStatus(slot)
      if (action === 'delete') {
        if (!(await confirmDialog(`Hapus slot ${slot}?`, 'Konfigurasi dihapus dari database dan server berhenti dipantau.'))) return
        try {
          await api(`servers/${slot}`, { method: 'DELETE' })
          toast('Slot dihapus.')
          await loadServers()
        } catch (error) { toast(error.message, true) }
      }
    })

    $('#serverTable').addEventListener('submit', async event => {
      const form = event.target.closest('#slotForm')
      if (!form) return
      event.preventDefault()
      const slot = Number(form.elements.slot.value)
      if (!slot) return toast('Pilih slot 1–10 terlebih dahulu.', true)
      try {
        await api(`servers/${slot}`, {
          method: 'PUT',
          body: {
            enabled: form.elements.enabled.checked,
            name: form.elements.name.value.trim(),
            host: form.elements.host.value.trim(),
            credentialRef: form.elements.credentialRef.value.trim(),
            panelServerId: form.elements.panelServerId.value.trim(),
          },
        })
        toast('Slot tersimpan.')
        await loadServers()
      } catch (error) { toast(error.message, true) }
    })

    $('#serverDetail').addEventListener('click', async event => {
      const power = event.target.closest('[data-power]')
      if (power) {
        try { await serverPower(power.dataset.power, power.dataset.signal) } catch (error) { toast(error.message, true) }
        return
      }
      const logs = event.target.closest('[data-logs]')
      if (logs) await serverLogs(logs.dataset.logs)
    })
    $('#closeServerDetail').addEventListener('click', () => { $('#serverDetailCard').hidden = true })

    const premiumButton = $('#togglePremium')
    if (premiumButton) {
      premiumButton.addEventListener('click', async () => {
        const enabled = premiumButton.dataset.enabled !== '1'
        const ok = await confirmDialog(
          enabled ? 'Nyalakan mode premium?' : 'Matikan mode premium?',
          enabled
            ? 'Semua bot kembali menerapkan fitur premium sesuai daftar masing-masing.'
            : 'Semua fitur premium di semua bot menjadi gratis sampai dinyalakan lagi.',
        )
        if (!ok) return
        try {
          await api('premium-mode', { method: 'POST', body: { enabled } })
          toast(`Mode premium platform ${enabled ? 'ON' : 'OFF'}.`)
          await loadPremium()
        } catch (error) { toast(error.message, true) }
      })
    }
    const refreshPremium = $('#refreshPremium')
    if (refreshPremium) refreshPremium.addEventListener('click', () => loadPremium().catch(error => toast(error.message, true)))

    $('#userTable').addEventListener('click', async event => {
      const button = event.target.closest('[data-save-role]')
      if (!button) return
      const id = button.dataset.saveRole
      const select = document.querySelector(`[data-role-user="${CSS.escape(id)}"]`)
      if (!select) return
      if (!(await confirmDialog('Ubah peran?', `Peran akun ini menjadi "${select.value}". Aksi dicatat di audit.`))) return
      try {
        await api(`users/${encodeURIComponent(id)}/role`, { method: 'PATCH', body: { role: select.value } })
        toast('Peran diperbarui.')
        await loadUsers()
      } catch (error) { toast(error.message, true) }
    })

    $('#auditReload').addEventListener('click', () => loadAudit().catch(error => toast(error.message, true)))
    $('#auditFilter').addEventListener('keydown', event => {
      if (event.key === 'Enter') loadAudit().catch(error => toast(error.message, true))
    })

    document.addEventListener('click', async event => {
      if (event.target.id === 'createLinkBtn') {
        try { await createLink() } catch (error) { toast(error.message, true) }
        return
      }
      const link = event.target.closest('[data-link]')
      if (link) {
        try { await createMediaLink(link.dataset.link) } catch (error) { toast(error.message, true) }
        return
      }
      const del = event.target.closest('[data-media]')
      if (del) {
        if (!(await confirmDialog('Hapus media?', 'Tautan yang sudah dibagikan akan berhenti bekerja.'))) return
        try {
          await api(`media/${del.dataset.media}`, { method: 'DELETE' })
          toast('Media dihapus.')
          await loadMedia()
        } catch (error) { toast(error.message, true) }
      }
    })
  }

  bind()
  boot()
})()
