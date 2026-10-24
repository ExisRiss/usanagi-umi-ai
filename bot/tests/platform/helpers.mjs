/* Fixture bersama tes platform: database terpisah + mock Telegram Bot API. */
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setPlatformDbForTests } from '../../lib/platform/db.js'

export const TEST_KEY = 'a'.repeat(64)
export const TEST_API_SECRET = 'rahasia-platform-uji-1234567890abcdef'

export async function freshDb() {
  const { default: Database } = await import('better-sqlite3')
  const { migrate } = await import('../../lib/platform/db.js')
  const db = new Database(':memory:')
  db.pragma('journal_mode = MEMORY')
  setPlatformDbForTests(db)
  migrate(db)
  return db
}

/** Terapkan env uji ke process.env (dipakai modul yang membaca env default). */
export function applyTestEnv(overrides = {}) {
  Object.assign(process.env, {
    PLATFORM_SECRET_KEY: TEST_KEY,
    PLATFORM_API_SECRET: TEST_API_SECRET,
    PLATFORM_MEDIA_SIGNING_KEY: TEST_KEY,
    PLATFORM_PUBLIC_BASE_URL: 'http://127.0.0.1:2144',
    ...overrides,
  })
}

export function tempDir(prefix = 'umi-platform-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

export function env(overrides = {}) {
  return {
    PLATFORM_SECRET_KEY: TEST_KEY,
    PLATFORM_API_SECRET: TEST_API_SECRET,
    PLATFORM_MEDIA_SIGNING_KEY: TEST_KEY,
    PLATFORM_PUBLIC_BASE_URL: 'http://127.0.0.1:2144',
    ...(process.env.TELEGRAM_API_BASE ? { TELEGRAM_API_BASE: process.env.TELEGRAM_API_BASE } : {}),
    ...overrides,
  }
}

/**
 * Mock Telegram Bot API: meniru kontrak endpoint nyata (ok/result/error_code)
 * sehingga kode klien, poller, router, dan command diuji apa adanya.
 */
export async function mockTelegram({ token = '123456:mock-token-abcdefghijklmnop', updates = [] } = {}) {
  const state = {
    updates: [...updates],
    offset: 0,
    calls: [],
    sent: [],
    edited: [],
    answers: [],
    failGetMe: false,
    failUpdates: null,
    rateLimitOnce: false,
    webhook: null,
    commands: null,
  }
  const server = http.createServer((req, res) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
      const url = new URL(req.url, 'http://localhost')
      const match = url.pathname.match(/\/bot([^/]+)\/(\w+)$/)
      const fileMatch = url.pathname.match(/\/file\/bot([^/]+)\/(.+)$/)
      const reply = payload => {
        const data = Buffer.from(JSON.stringify(payload))
        res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': data.length })
        res.end(data)
      }
      if (fileMatch) {
        const data = Buffer.from('file-bytes')
        res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': data.length })
        return res.end(data)
      }
      if (!match) return reply({ ok: false, error_code: 404, description: 'Not Found' })
      const [, provided, method] = match
      state.calls.push({ method, token: provided, body })
      if (provided !== token) return reply({ ok: false, error_code: 401, description: 'Unauthorized' })

      if (method === 'getMe') {
        if (state.failGetMe) return reply({ ok: false, error_code: 401, description: 'Unauthorized' })
        return reply({ ok: true, result: { id: 8870227075, is_bot: true, first_name: 'Uji', username: 'uji_bot' } })
      }
      if (method === 'getUpdates') {
        if (state.rateLimitOnce) {
          state.rateLimitOnce = false
          return reply({ ok: false, error_code: 429, description: 'Too Many Requests: retry after 1', parameters: { retry_after: 1 } })
        }
        if (state.failUpdates) return reply({ ok: false, error_code: 502, description: state.failUpdates })
        const offset = Number(body.offset || 0)
        const batch = state.updates.filter(update => update.update_id >= offset).slice(0, Number(body.limit || 50))
        return reply({ ok: true, result: batch })
      }
      if (method === 'sendMessage') {
        state.sent.push(body)
        return reply({ ok: true, result: { message_id: state.sent.length + 1000, chat: { id: body.chat_id }, text: body.text } })
      }
      if (method === 'editMessageText') {
        state.edited.push(body)
        return reply({ ok: true, result: { message_id: body.message_id } })
      }
      if (method === 'answerCallbackQuery') {
        state.answers.push(body)
        return reply({ ok: true, result: true })
      }
      if (method === 'setMyCommands') {
        state.commands = body.commands
        return reply({ ok: true, result: true })
      }
      if (method === 'setWebhook') {
        state.webhook = body
        return reply({ ok: true, result: true })
      }
      if (method === 'deleteWebhook') {
        state.webhook = null
        return reply({ ok: true, result: true })
      }
      if (method === 'getFile') {
        return reply({ ok: true, result: { file_id: body.file_id, file_path: `documents/${body.file_id}.bin`, file_size: 10 } })
      }
      return reply({ ok: true, result: true })
    })
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  return {
    base, token, state,
    close: () => new Promise(resolve => server.close(resolve)),
  }
}

export function messageUpdate({ updateId, userId, username = 'user', text, chatType = 'private', extra = {} }) {
  return {
    update_id: updateId,
    message: {
      message_id: updateId + 1,
      date: Math.floor(Date.now() / 1000),
      chat: { id: Number(userId), type: chatType, username },
      from: { id: Number(userId), is_bot: false, first_name: username, username },
      text,
      ...extra,
    },
  }
}
