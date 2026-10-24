import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { decryptFile, encryptFile, readHeader } from '../../lib/backup/crypto.js'
import { tempDir, write } from './helpers.mjs'

const rawKey = crypto.randomBytes(32).toString('hex')

test('enkripsi + dekripsi mengembalikan isi yang sama (kunci mentah)', async () => {
  const root = tempDir()
  const source = write(path.join(root, 'plain.txt'), 'rahasia backup '.repeat(1000))
  const enc = path.join(root, 'plain.enc')
  const out = path.join(root, 'out.txt')
  const meta = await encryptFile(source, enc, rawKey)
  assert.equal(meta.algorithm, 'aes-256-gcm')
  assert.notEqual(fs.readFileSync(enc).subarray(0, 8).toString('latin1'), fs.readFileSync(source).subarray(0, 8).toString('latin1'))
  await decryptFile(enc, out, rawKey)
  assert.equal(fs.readFileSync(out, 'utf8'), fs.readFileSync(source, 'utf8'))
})

test('passphrase memakai scrypt dan tetap bisa dibuka', async () => {
  const root = tempDir()
  const source = write(path.join(root, 'plain.txt'), 'halo dunia')
  const enc = path.join(root, 'plain.enc')
  const out = path.join(root, 'out.txt')
  await encryptFile(source, enc, 'passphrase-super-panjang')
  const header = readHeader(enc)
  assert.equal(header.kdf, 1)
  await decryptFile(enc, out, 'passphrase-super-panjang')
  assert.equal(fs.readFileSync(out, 'utf8'), 'halo dunia')
})

test('arsip yang diubah ditolak oleh tag GCM', async () => {
  const root = tempDir()
  const source = write(path.join(root, 'plain.txt'), 'x'.repeat(4096))
  const enc = path.join(root, 'plain.enc')
  await encryptFile(source, enc, rawKey)
  const buffer = fs.readFileSync(enc)
  buffer[buffer.length - 20] ^= 0xff
  fs.writeFileSync(enc, buffer)
  await assert.rejects(() => decryptFile(enc, path.join(root, 'out.txt'), rawKey))
})

test('kunci salah tidak bisa membuka arsip', async () => {
  const root = tempDir()
  const source = write(path.join(root, 'plain.txt'), 'data')
  const enc = path.join(root, 'plain.enc')
  await encryptFile(source, enc, rawKey)
  await assert.rejects(() => decryptFile(enc, path.join(root, 'out.txt'), crypto.randomBytes(32).toString('hex')))
})

test('berkas bukan arsip enkripsi ditolak', () => {
  const root = tempDir()
  const fake = write(path.join(root, 'fake.enc'), 'bukan arsip')
  assert.throws(() => readHeader(fake))
})
