// lib/magma.js
// MAGMA Indonesia - Erupsi Gunung Api Scraper (ESM)

'use strict';

// ============================================================================
// Konfigurasi
// ============================================================================
const config = {
  baseUrl: 'https://magma.esdm.go.id',
  listPath: '/v1/gunung-api/informasi-letusan',
  realtimePath: '/v1/json/var',
  maxRetries: 3,
  backoffBaseMs: 1000,
  backoffMaxMs: 30000,
  timeoutMs: 30000,
  requestDelayMs: 500,
  userAgent:
    'MAGMA-Indo-ResearchBot/1.0 (+https://magma.esdm.go.id; public data research)',
};

// ============================================================================
// Session
// ============================================================================
const session = { cookie: '', csrf: null, signature: null, bootstrapped: false };
let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function rateLimit() {
  const now = Date.now();
  const delta = now - lastRequestAt;
  if (lastRequestAt && delta < config.requestDelayMs) {
    await sleep(config.requestDelayMs - delta);
  }
  lastRequestAt = Date.now();
}

function mergeCookies(current, setCookies) {
  const jar = new Map();
  const put = (pairs) => {
    for (const part of pairs) {
      const pair = part.split(';')[0];
      const eq = pair.indexOf('=');
      if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  };
  if (current) put(current.split(/;\s*/));
  put(setCookies || []);
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

function storeCookies(res) {
  let setCookies = [];
  if (typeof res.headers.getSetCookie === 'function') {
    setCookies = res.headers.getSetCookie();
  } else {
    const combined = res.headers.get('set-cookie');
    if (combined) setCookies = [combined];
  }
  if (setCookies.length) session.cookie = mergeCookies(session.cookie, setCookies);
}

// ============================================================================
// HTTP client
// ============================================================================
async function request(url, options = {}, csrfRetried = false) {
  let lastError;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    await rateLimit();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      const headers = {
        'User-Agent': config.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        ...(options.headers || {}),
      };
      if (session.cookie) headers.Cookie = session.cookie;

      const res = await fetch(url, {
        method: options.method || 'GET',
        body: options.body,
        headers,
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timer);
      storeCookies(res);

      if ([429, 500, 502, 503, 504].includes(res.status)) {
        throw new Error(`transient HTTP ${res.status}`);
      }
      if (res.status === 419 && !csrfRetried) {
        resetSession();
        await bootstrap();
        return request(url, options, true);
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt === config.maxRetries) break;
      const delay = Math.min(config.backoffBaseMs * 2 ** attempt, config.backoffMaxMs);
      await sleep(delay + Math.random() * delay * 0.25);
    }
  }
  throw new Error(`Request gagal setelah retry: ${url} (${lastError && lastError.message})`);
}

function resetSession() {
  session.csrf = null;
  session.signature = null;
  session.bootstrapped = false;
}

function extractCsrf(html) {
  const m = html.match(/name="csrf-token"\s+content="([^"]+)"/);
  return m ? m[1] : null;
}

function extractSignature(html) {
  const m = html.match(/\/v1\/json\/var\?signature=([a-f0-9]{64})/);
  return m ? m[1] : null;
}

async function bootstrap() {
  if (session.bootstrapped) return;
  const res = await request(`${config.baseUrl}/`);
  const html = await res.text();
  session.csrf = extractCsrf(html);
  session.signature = extractSignature(html);
  session.bootstrapped = true;
}

// ============================================================================
// Helpers HTML/teks
// ============================================================================
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  plusmn: '±', deg: '°', times: '×', divide: '÷', hellip: '…',
  mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“',
  rdquo: '”', middot: '·', eacute: 'é', sup2: '²', sup3: '³',
};

function decodeEntities(str) {
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, ent) => {
    if (ent[0] === '#') {
      const code = ent[1] === 'x' || ent[1] === 'X'
        ? parseInt(ent.slice(2), 16)
        : parseInt(ent.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, ent) ? ENTITIES[ent] : m;
  });
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ''));
}

function cleanText(html) {
  return stripTags(html).replace(/\s+/g, ' ').trim();
}

function cleanMultiline(html) {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, '\n'))
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l, i, arr) => l || (i > 0 && i < arr.length - 1))
    .join('\n')
    .trim();
}

const MONTHS = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};

function parseIndonesianDate(text) {
  const m = String(text || '').match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return { day: Number(m[1]), month, year: Number(m[3]) };
}

function parseLocalTime(text) {
  const m = String(text || '').match(/(\d{1,2}):(\d{2})\s*(WIB|WITA|WIT)/);
  if (!m) return null;
  return { hhmm: `${String(Number(m[1])).padStart(2, '0')}:${m[2]}`, tz: m[3] };
}

function combineDateTime(date, time) {
  if (!date || !time) return null;
  const [h, mi] = time.hhmm.split(':').map(Number);
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day, h, mi));
  if (
    d.getUTCFullYear() !== date.year ||
    d.getUTCMonth() !== date.month - 1 ||
    d.getUTCDate() !== date.day
  ) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${date.year}-${p(date.month)}-${p(date.day)}T${p(h)}:${p(mi)}`;
}

const UUID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

const STATUS_LABELS = {
  1: 'Level I (Normal)',
  2: 'Level II (Waspada)',
  3: 'Level III (Siaga)',
  4: 'Level IV (Awas)',
};

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// ============================================================================
// Parsers
// ============================================================================
function parsePagination(html) {
  const info = { current: 1, total: null, hasNext: false };
  const menuMatch = html.match(/<div class="ui pagination menu">([\s\S]*?)<\/div>/);
  const menu = menuMatch ? menuMatch[1] : '';
  const pages = [];
  let current = null;
  const re = /<a[^>]*href="([^"]*[?&]page=(\d+))"[^>]*>/g;
  let m;
  while ((m = re.exec(menu))) {
    const page = Number(m[2]);
    pages.push(page);
    if (/btn-secondary/.test(m[0])) current = page;
  }
  info.current = current !== null ? current : pages.length ? Math.max(...pages) : 1;
  info.total = pages.length ? Math.max(...pages) : info.current;
  info.hasNext = /rel="next"/.test(menu);
  return info;
}

function parseYearCounts(html) {
  const counts = {};
  const re = /<div class="col-4[^"]*">\s*([\d.,]+)\s*<\/div>\s*<div class="col-8">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const count = Number(m[1].replace(/[.,]/g, ''));
    const nameMatch = m[2].match(/<b[^>]*>([\s\S]*?)<\/b>/);
    const name = nameMatch ? cleanText(nameMatch[1]) : '';
    if (name && Number.isFinite(count)) counts[name] = count;
  }
  return counts;
}

function parseListPage(html, options = {}) {
  const volcanoCode = options.volcanoCode || null;
  const nameToCode = options.nameToCode || {};
  const result = {
    eruptions: [],
    pagination: parsePagination(html),
    yearCounts: parseYearCounts(html),
    pageDateLabel: null,
  };

  const chunks = html.split(/<div class="timeline-item/).slice(1);
  let currentDateLabel = null;

  for (const chunk of chunks) {
    if (/<p class="timeline-date">/.test(chunk)) {
      const dm = chunk.match(/<p class="timeline-date">([\s\S]*?)<\/p>/);
      if (dm) {
        currentDateLabel = cleanText(dm[1]);
        if (result.pageDateLabel === null) result.pageDateLabel = currentDateLabel;
      }
      continue;
    }

    const titleM = chunk.match(/<p class="timeline-title">\s*<a[^>]*>([\s\S]*?)<\/a>/);
    if (!titleM) continue;

    const timeM = chunk.match(/<div class="timeline-time">\s*<small>([\s\S]*?)<\/small>/);
    const authorM = chunk.match(/<p class="timeline-author">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
    const textM = chunk.match(/<p class="timeline-text">([\s\S]*?)<\/p>/);
    const imageM = chunk.match(/<a\s+href="([^"]*)"\s+data-lightbox="file-set"/);
    const detailM = chunk.match(/<a\s+href="([^"]*\/show)"[^>]*class="btn btn-sm btn-outline-primary"/);

    const timeStr = timeM ? cleanText(timeM[1]) : '';
    const time = parseLocalTime(timeStr);
    const date = parseIndonesianDate(currentDateLabel || '');
    const detailUrl = detailM ? detailM[1] : null;
    const idMatch = detailUrl ? detailUrl.match(UUID_RE) : null;

    const volcanoName = cleanText(titleM[1]);
    result.eruptions.push({
      id: idMatch ? idMatch[1] : null,
      volcanoName,
      volcanoCode: volcanoCode || nameToCode[volcanoName] || null,
      description: textM ? cleanText(textM[1]) : '',
      localTime: combineDateTime(date, time),
      timezone: time ? time.tz : null,
      dateLabel: currentDateLabel,
      author: authorM ? cleanText(authorM[1]) : null,
      imageUrl: imageM && imageM[1] ? imageM[1] : null,
      detailUrl,
      recommendation: null,
      coordinates: null,
      scrapedAt: new Date().toISOString(),
    });
  }
  return result;
}

function parseDetailPage(html, id) {
  const labelM = html.match(/<h5 class="blog-title">\s*<a[^>]*>([\s\S]*?)<\/a>/);
  const categoryM = html.match(/<p class="blog-category[^"]*">([\s\S]*?)<\/p>/);
  const subtitleM = html.match(/<p class="card-subtitle[^"]*">([\s\S]*?)<\/p>\s*<p>([\s\S]*?)<\/p>/);
  const recM = html.match(/<p class="blog-text">([\s\S]*?)<\/p>/);
  const imageM = html.match(/<figure>[\s\S]*?<img src="([^"]*)"/);
  const codeM = html.match(/MAG_CODE='([A-Z0-9]+)'/);
  const centerM = html.match(/center:\s*\[(-?[\d.]+),\s*(-?[\d.]+)\]/);

  const category = categoryM ? cleanText(categoryM[1]) : '';
  const description = subtitleM ? cleanText(subtitleM[2]) : '';
  const date = parseIndonesianDate(category);
  const time = parseLocalTime(description);

  let volcanoLabel = labelM ? cleanText(labelM[1]) : '';
  const volcanoName = volcanoLabel.replace(/^Gunung\s+Api\s+/i, '').trim();

  let author = subtitleM ? cleanText(subtitleM[1]) : null;
  if (author) author = author.replace(/^Dibuat oleh,?\s*/i, '').trim() || null;

  let recommendation = null;
  if (recM) {
    const text = cleanMultiline(recM[1]);
    recommendation = text.replace(/^rekomendasi\s*\n?/i, '').trim();
  }

  return {
    id: id || null,
    volcanoName: volcanoName || volcanoLabel || null,
    volcanoCode: codeM ? codeM[1] : null,
    description,
    localTime: combineDateTime(date, time),
    timezone: time ? time.tz : null,
    dateLabel: category,
    author,
    imageUrl: imageM ? imageM[1] : null,
    detailUrl: id ? `${config.listPath}/${id}/show` : null,
    recommendation,
    coordinates: centerM ? [Number(centerM[1]), Number(centerM[2])] : null,
    scrapedAt: new Date().toISOString(),
  };
}

function parseHomepageVolcanoes(html) {
  let m = html.match(/var\s+markersGunungApi\s*=\s*(\[[\s\S]*?\])\s*[,;]/);
  if (!m) m = html.match(/var\s+markersGunungApi\s*=\s*(\[[\s\S]*?\])/);
  if (!m) return [];
  let raw;
  try { raw = JSON.parse(m[1]); } catch { return []; }
  return raw
    .filter((it) => it && it.ga_code)
    .map((it) => ({
      code: String(it.ga_code),
      name: it.ga_nama_gapi || '',
      lat: num(it.ga_lat_gapi),
      lon: num(it.ga_lon_gapi),
      elevation: num(it.ga_elev_gapi),
      province: it.ga_prov_gapi ?? null,
      kabupaten: it.ga_kab_gapi ?? null,
      status: num(it.ga_status),
      hasVona: Boolean(it.has_vona),
    }));
}

function normalizeStatus(payload, code) {
  const d = (payload && payload.data) || {};
  const g = d.gunungapi || {};
  const status = num(g.status);
  return {
    code,
    name: g.nama || '',
    status,
    statusLabel: STATUS_LABELS[status] || 'Unknown',
    coordinates: Array.isArray(g.koordinat) ? g.koordinat.map(Number) : null,
    hasVona: String(g.has_vona) === '1',
    reportPeriod: (d.laporan || {}).tanggal || null,
    reportAuthor: (d.laporan || {}).pembuat || null,
    visual: (d.visual || {}).deskripsi || null,
    visualOther: (d.visual || {}).lainnya || null,
    visualPhoto: (d.visual || {}).foto || null,
    climatology: (d.klimatologi || {}).deskripsi || null,
    seismic: (d.gempa || {}).deskripsi || [],
    seismicChart: (d.gempa || {}).grafik || null,
    recommendation: d.rekomendasi || null,
    vona: d.vona || null,
    scrapedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Public API
// ============================================================================
const KNOWN_CODE_BY_NAME = {
  Agung: 'AGU', Bromo: 'BRO', Dempo: 'DEM', Dukono: 'DUK',
  Gamalama: 'GML', Ibu: 'IBU', Karangetang: 'KAR', Kerinci: 'KER',
  'Anak Krakatau': 'KRA', 'Ili Lewotolok': 'LEW',
  'Lewotobi Laki-laki': 'LWK', Marapi: 'MAR', Merapi: 'MER',
  Raung: 'RAU', Ruang: 'RUA', Sinabung: 'SIN', Semeru: 'SMR',
  Soputan: 'SOP', 'Tangkuban Parahu': 'TPR',
};

let _catalog = null;
const _nameToCode = { ...KNOWN_CODE_BY_NAME };

function buildUrl(path, params) {
  const url = new URL(path.startsWith('http') ? path : config.baseUrl + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== null && v !== undefined) url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function getHtml(path, params) {
  const res = await request(buildUrl(path, params));
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${path}`);
  return res.text();
}

async function getVolcanoCatalog({ refresh = false } = {}) {
  if (_catalog && !refresh) return _catalog;
  const html = await getHtml('/');
  const catalog = parseHomepageVolcanoes(html);
  for (const v of catalog) if (v.name) _nameToCode[v.name] = v.code;
  _catalog = catalog;
  return catalog;
}

async function getList(page = 1, volcanoCode = null) {
  const path = volcanoCode ? `${config.listPath}/${volcanoCode}` : config.listPath;
  const params = page > 1 ? { page } : null;
  const html = await getHtml(path, params);
  return parseListPage(html, { volcanoCode, nameToCode: _nameToCode });
}

async function fetchAllPages({ maxPages = null, volcanoCode = null, stopAtDuplicate = true } = {}) {
  const seen = new Set();
  const eruptions = [];
  let page = 1;
  let info = { hasNext: false };

  while (true) {
    const result = await getList(page, volcanoCode);
    info = result.pagination;

    for (const e of result.eruptions) {
      if (stopAtDuplicate && e.id && seen.has(e.id)) return eruptions;
      if (e.id) seen.add(e.id);
      eruptions.push(e);
    }

    const keepGoing = (maxPages === null || page < maxPages) && info.hasNext && result.eruptions.length > 0;
    if (!keepGoing) break;
    page += 1;
  }
  return eruptions;
}

async function getDetail(eruptionId) {
  const html = await getHtml(`${config.listPath}/${eruptionId}/show`);
  return parseDetailPage(html, eruptionId);
}

async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function fetchDetails(eruptions, { concurrency = 8 } = {}) {
  const items = [...eruptions];
  return await mapConcurrent(items, concurrency, async (e) => {
    if (!e.id) return e;
    try {
      const detail = await getDetail(e.id);
      return {
        ...e,
        volcanoCode: detail.volcanoCode || e.volcanoCode,
        recommendation: detail.recommendation,
        coordinates: detail.coordinates,
        imageUrl: e.imageUrl || detail.imageUrl,
      };
    } catch {
      return e;
    }
  });
}

async function getRealTimeStatus(volcanoCode) {
  await bootstrap();
  const params = session.signature ? { signature: session.signature } : null;
  const res = await request(buildUrl(config.realtimePath, params), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-CSRF-TOKEN': session.csrf || '',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: `${config.baseUrl}/`,
    },
    body: new URLSearchParams({ ga_code: volcanoCode }).toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - realtime ${volcanoCode}`);
  const payload = await res.json();
  const status = normalizeStatus(payload, volcanoCode);
  const volcano = _catalog && _catalog.find((v) => v.code === volcanoCode);
  if (volcano && volcano.name) status.name = volcano.name;
  return status;
}

async function fetchRealTimeStatuses(codes = null, { concurrency = 5 } = {}) {
  let list = codes;
  if (!list) {
    const catalog = await getVolcanoCatalog();
    list = catalog.map((v) => v.code);
  }
  list = [...new Set(list)];
  const results = await mapConcurrent(list, concurrency, async (code) => {
    try { return await getRealTimeStatus(code); } catch { return null; }
  });
  return results.filter(Boolean);
}

function search(query, eruptions, { fields = ['volcanoName', 'description', 'author'], volcanoCode = null } = {}) {
  const keywords = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  return eruptions.filter((e) => {
    if (volcanoCode && e.volcanoCode !== volcanoCode) return false;
    if (!keywords.length) return true;
    const haystack = fields.map((f) => String(e[f] ?? '')).join(' ').toLowerCase();
    return keywords.every((k) => haystack.includes(k));
  });
}

function groupByVolcano(eruptions) {
  const groups = {};
  for (const e of eruptions) {
    (groups[e.volcanoName] ||= []).push(e);
  }
  return groups;
}

// ============================================================================
// Exports (ESM)
// ============================================================================
export const magma = {
  config,
  getList,
  fetchAllPages,
  getDetail,
  fetchDetails,
  getRealTimeStatus,
  fetchRealTimeStatuses,
  getVolcanoCatalog,
  search,
  groupByVolcano,
  parseListPage,
  parseDetailPage,
  parseHomepageVolcanoes,
  normalizeStatus,
  parsePagination,
  parseYearCounts,
};

export default magma;