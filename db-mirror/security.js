// Shared hardening helpers for the game server.
// No external dependencies: safe to import from the Node-only game process.

const buckets = new Map()
const MAX_BUCKETS = 10000

export const SECURITY_HEADERS = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Content-Security-Policy': "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
    'Cross-Origin-Opener-Policy': 'same-origin',
    'X-Permitted-Cross-Domain-Policies': 'none',
}

export function clientIp(req) {
    const direct = String(req?.headers?.['cf-connecting-ip'] || '').trim()
    if (direct) return direct
    const forwarded = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
    if (forwarded) return forwarded
    return String(req?.socket?.remoteAddress || 'unknown')
}

/** Fixed-window limiter. Returns {limited, retryAfter}. */
export function rateLimit(req, scope, limit, windowMs) {
    const now = Date.now()
    const key = `${scope}:${clientIp(req)}`
    let row = buckets.get(key)
    if (!row || row.reset <= now) {
        row = { count: 0, reset: now + windowMs }
        buckets.set(key, row)
    }
    row.count += 1
    if (buckets.size > MAX_BUCKETS) {
        for (const [entryKey, entry] of buckets) if (entry.reset <= now) buckets.delete(entryKey)
    }
    if (row.count > limit) return { limited: true, retryAfter: Math.max(1, Math.ceil((row.reset - now) / 1000)) }
    return { limited: false, retryAfter: 0 }
}

/** Account API token: header first, then Bearer. Query strings are rejected by callers. */
export function headerToken(req, header = 'x-umi-token') {
    const direct = String(req?.headers?.[header] || '').trim()
    if (direct) return direct
    return String(req?.headers?.authorization || '').replace(/^Bearer\s+/i, '').trim()
}

export function hasQueryToken(url) {
    return Boolean(url?.searchParams?.get('token'))
}
