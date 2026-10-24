import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createArchive, listArchive, extractArchive, isSafeEntryName, sha256File } from '../../lib/backup/archive.js'
import { tempDir, write } from './helpers.mjs'

test('arsip tar.gz dibuat, bisa dibaca ulang, dan dapat diekstrak', async () => {
  const root = tempDir()
  write(path.join(root, 'a.txt'), 'hello')
  write(path.join(root, 'nested', 'b.txt'), 'world')
  const file = path.join(root, 'out.tar.gz')
  await createArchive({ file, cwd: root, entries: ['a.txt', 'nested/b.txt'] })
  assert.ok(fs.statSync(file).size > 0)

  const entries = await listArchive(file)
  const names = entries.map(entry => entry.name).sort()
  assert.deepEqual(names, ['a.txt', 'nested/b.txt'])

  const target = path.join(root, 'extracted')
  fs.mkdirSync(target)
  await extractArchive({ file, cwd: target })
  assert.equal(fs.readFileSync(path.join(target, 'nested', 'b.txt'), 'utf8'), 'world')
})

test('nama entri berbahaya ditolak', () => {
  assert.equal(isSafeEntryName('config/data/x.json'), true)
  assert.equal(isSafeEntryName('../etc/passwd'), false)
  assert.equal(isSafeEntryName('/etc/passwd'), false)
  assert.equal(isSafeEntryName('a/../../b'), false)
  assert.equal(isSafeEntryName('C:\\windows\\system32'), false)
  assert.equal(isSafeEntryName('a\0b'), false)
})

test('arsip dengan path traversal ditolak saat ekstraksi', async () => {
  const root = tempDir()
  write(path.join(root, 'ok.txt'), 'ok')
  const file = path.join(root, 'evil.tar.gz')
  await createArchive({ file, cwd: root, entries: ['ok.txt'] })

  // Sisipkan entri jahat dengan menulis header tar mentah lalu gzip ulang.
  const zlib = await import('node:zlib')
  const raw = zlib.gunzipSync(fs.readFileSync(file))
  // Buang blok penanda akhir arsip supaya entri jahat benar-benar terbaca.
  let end = raw.length
  while (end >= 512 && raw.subarray(end - 512, end).every(byte => byte === 0)) end -= 512
  const evil = makeTarEntry('../escape.txt', Buffer.from('pwned'))
  fs.writeFileSync(file, zlib.gzipSync(Buffer.concat([raw.subarray(0, end), evil, Buffer.alloc(1024)])))

  const target = path.join(root, 'out')
  fs.mkdirSync(target, { recursive: true })
  await assert.rejects(() => extractArchive({ file, cwd: target }))
  assert.equal(fs.existsSync(path.join(root, 'escape.txt')), false)
})

function makeTarEntry(name, content) {
  const header = Buffer.alloc(512)
  header.write(name, 0, 100, 'utf8')
  header.write('0000644\0', 100, 8)
  header.write('0000000\0', 108, 8)
  header.write('0000000\0', 116, 8)
  header.write(`${content.length.toString(8).padStart(11, '0')}\0`, 124, 12)
  header.write('00000000000\0', 136, 12)
  header.write('        ', 148, 8)
  header.write('0', 156, 1)
  header.write('ustar\0', 257, 6)
  header.write('00', 263, 2)
  let checksum = 0
  for (const byte of header) checksum += byte
  header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8)
  const padding = Buffer.alloc((512 - (content.length % 512)) % 512)
  return Buffer.concat([header, content, padding])
}

test('sha256File konsisten untuk isi yang sama', async () => {
  const root = tempDir()
  const a = write(path.join(root, 'a.bin'), 'data')
  const first = await sha256File(a)
  const second = await sha256File(a)
  assert.equal(first, second)
  assert.equal(first.length, 64)
})
