/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios';
import { compactDecoratedText } from './awang-reply.js';

const cache = new Map();
const selections = new Map();

const now = () => Date.now();

export const trimText = (value, max = 240) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    if (text.length <= max) return text;
    const cut = text.slice(0, Math.max(1, max - 1)).trimEnd();
    const point = cut.lastIndexOf(' ');
    return `${(point > max * 0.55 ? cut.slice(0, point) : cut)}…`;
};

export const htmlToText = (value, max = 220) => {
    return trimText(
        String(value ?? '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<\/li>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&#x27;/gi, "'")
            .replace(/\s+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n'),
        max
    );
};

export const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(String(value).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(n)) return trimText(value, 28);
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`;
    return String(Math.trunc(n));
};

export const formatScore = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '-';
    return n > 10 ? (n / 10).toFixed(1) : n.toFixed(1);
};

export const formatDuration = (seconds) => {
    const n = Number(seconds);
    if (!Number.isFinite(n) || n <= 0) return '-';
    const h = Math.floor(n / 3600);
    const m = Math.floor((n % 3600) / 60);
    const s = Math.floor(n % 60);
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
};

export const pick = (...values) => values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

export const toAbsoluteUrl = (value, base = '') => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    try {
        return new URL(raw, base || undefined).href;
    } catch {
        return '';
    }
};

const request = async (config = {}, attempts = 2) => {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            return await axios.request({
                timeout: 15000,
                validateStatus: () => true,
                ...config
            });
        } catch (error) {
            lastError = error;
            if (i + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 350 * (i + 1)));
        }
    }
    throw lastError;
};

export const getText = async (url, config = {}, attempts = 2) => {
    const response = await request({
        method: 'GET',
        url,
        headers: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36',
            accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
            ...config.headers
        },
        responseType: 'text'
    }, attempts);
    if (response.status >= 400) throw new Error(`HTTP_${response.status}`);
    return String(response.data ?? '');
};

export const getJson = async (url, config = {}, attempts = 2) => {
    const response = await request({
        method: 'GET',
        url,
        headers: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36',
            accept: 'application/json,text/plain,*/*',
            ...config.headers
        },
        responseType: 'json'
    }, attempts);
    if (response.status >= 400) throw new Error(`HTTP_${response.status}`);
    return response.data;
};

export const postJson = async (url, data, config = {}, attempts = 2) => {
    const response = await request({
        method: 'POST',
        url,
        data,
        headers: {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36',
            accept: 'application/json,text/plain,*/*',
            ...config.headers
        },
        responseType: 'json'
    }, attempts);
    if (response.status >= 400) throw new Error(`HTTP_${response.status}`);
    return response.data;
};

export const probeUrl = async (url) => {
    if (!url) return false;
    try {
        const response = await request({
            method: 'HEAD',
            url,
            headers: {
                accept: '*/*'
            }
        }, 1);
        if (response.status >= 200 && response.status < 400) return true;
    } catch {}
    try {
        const response = await request({
            method: 'GET',
            url,
            headers: {
                range: 'bytes=0-32',
                accept: '*/*'
            }
        }, 1);
        return response.status >= 200 && response.status < 500;
    } catch {
        return false;
    }
};

export const react = async (first, second, third) => {
    const m = third === undefined ? first : second;
    const emoji = third === undefined ? second : third;
    const conn = m?.conn || (third === undefined ? null : first);
    const key = m?.raw?.key || m?.key;
    if (!key || typeof conn?.sendMessage !== 'function') return null;
    try {
        return await conn.sendMessage(m.chat || key.remoteJid, {
            react: {
                text: String(emoji || ''),
                key
            }
        });
    } catch {
        return null;
    }
};

export const sendImage = async (first, second, third, fourth = '') => {
    const legacy = typeof second !== 'string' && third;
    const m = legacy ? second : first;
    const url = legacy ? third : second;
    const caption = compactDecoratedText(legacy ? fourth : third || '');
    const conn = m?.conn || (legacy ? first : null);
    return conn.sendMessage(m.chat, {
        image: { url },
        caption
    }, { quoted: m.raw });
};

export const sendVideo = async (first, second, third, fourth = '') => {
    const legacy = typeof second !== 'string' && third;
    const m = legacy ? second : first;
    const url = legacy ? third : second;
    const caption = compactDecoratedText(legacy ? fourth : third || '');
    const conn = m?.conn || (legacy ? first : null);
    return conn.sendMessage(m.chat, {
        video: { url },
        caption
    }, { quoted: m.raw });
};

export const sendGif = async (first, second, third, fourth = '') => {
    const legacy = typeof second !== 'string' && third;
    const m = legacy ? second : first;
    const url = legacy ? third : second;
    const caption = compactDecoratedText(legacy ? fourth : third || '');
    const conn = m?.conn || (legacy ? first : null);
    return conn.sendMessage(m.chat, {
        video: { url },
        gifPlayback: true,
        caption
    }, { quoted: m.raw });
};

export const sendAudio = async (m, url, fileName = 'audio.mp3') => {
    return m.conn.sendMessage(m.chat, {
        audio: { url },
        mimetype: 'audio/mpeg',
        fileName,
        ptt: false
    }, { quoted: m.raw });
};

export const sendInteractive = async (m, options = {}) => {
    if (typeof m?.conn?.sendInteractive === 'function') {
        return m.conn.sendInteractive(m.chat, { ...options, text: compactDecoratedText(options.text || '') }, { quoted: m.raw });
    }
    const buttons = (options.buttons || []).map((button) => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: button.text,
            id: button.id || button.command || ''
        })
    }));
    const rows = (options.rows || []).map((row) => ({
        id: row.command || row.id || '',
        title: row.title || '',
        description: row.description || ''
    }));
    return m.conn.sendMessage(m.chat, {
        text: options.text || '',
        footer: options.footer || '',
        buttons: rows.length ? [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: options.buttonText || 'Pilih',
                sections: [{ title: options.sectionTitle || 'Pilihan', rows }]
            })
        }] : buttons
    }, { quoted: m.raw });
};

export const buildSelectionId = (prefix, key) => {
    const clean = String(key ?? '').replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 120);
    return `${prefix}:${clean}`;
};

export const setSelection = (id, value, ttl = 12 * 60 * 1000) => {
    selections.set(id, {
        value,
        expires: now() + ttl
    });
};

export const getSelection = (id) => {
    const item = selections.get(id);
    if (!item) return null;
    if (item.expires < now()) {
        selections.delete(id);
        return null;
    }
    return item.value;
};

export const cached = async (key, producer, ttl = 30_000) => {
    const item = cache.get(key);
    if (item && item.expires > now()) return item.value;
    const value = await producer();
    cache.set(key, { value, expires: now() + ttl });
    return value;
};

export const createHeader = (title) => {
    return `╭─〔 ${title} 〕`;
};

export const createFooter = () => '╰──────────────';

export const formatLines = (title, lines = [], maxLine = 150) => {
    const out = [createHeader(title)];
    for (const line of lines) {
        if (!line) continue;
        const text = String(line).trim();
        if (!text) continue;
        out.push(`│ ${trimText(text, maxLine)}`);
    }
    out.push(createFooter());
    return out.join('\n');
};

export const extractMediaUrl = (data) => {
    const direct = [
        data?.url,
        data?.image,
        data?.imageUrl,
        data?.photoUrl,
        data?.avatar?.url,
        data?.image?.url,
        data?.data?.url,
        data?.data?.image,
        data?.data?.imageUrl,
        data?.data?.photoUrl,
        data?.results?.[0]?.url,
        data?.results?.[0]?.image,
        data?.results?.[0]?.imageUrl,
        data?.results?.[0]?.photoUrl
    ];
    for (const value of direct) {
        const url = toAbsoluteUrl(value);
        if (url) return url;
    }
    return '';
};

export const anilist = async (query, variables = {}) => {
    return postJson('https://graphql.anilist.co', {
        query,
        variables
    }, {
        headers: {
            origin: 'https://anilist.co',
            referer: 'https://anilist.co/'
        }
    }, 2);
};

export const safeCacheKey = (...parts) => parts.map((part) => String(part ?? '').trim().toLowerCase()).join('|');

export const getAiringDay = (timestamp) => {
    const date = new Date(Number(timestamp || 0) * 1000);
    if (!Number.isFinite(date.getTime())) return '-';
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long'
    }).format(date);
};

export const getJakartaDate = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());
    const obj = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return {
        year: Number(obj.year),
        month: Number(obj.month),
        day: Number(obj.day)
    };
};

export const chooseFirstValid = async (candidates = []) => {
    for (const candidate of candidates) {
        try {
            const value = await candidate();
            if (value) return value;
        } catch {}
    }
    return null;
};

export { selections };

export const truncate = trimText;
export const cleanText = htmlToText;
export const normalizeUrl = toAbsoluteUrl;
