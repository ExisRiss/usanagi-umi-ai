import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { loadPlatformEnv } from '../../lib/platform/env.js'

function tempEnvFile(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-env-'))
  const file = path.join(dir, '.platform.env')
  fs.writeFileSync(file, content, { mode: 0o600 })
  return file
}

test('membaca KEY=value, melewati komentar dan nilai kosong', () => {
  delete process.env.UMI_TEST_ENV_A
  delete process.env.UMI_TEST_ENV_B
  const file = tempEnvFile([
    '# komentar',
    'UMI_TEST_ENV_A=nilai-a',
    'UMI_TEST_ENV_B=',
    'bukan-baris-valid',
    'kunci-salah=nilai',
    '',
  ].join('\n'))
  const result = loadPlatformEnv(file)
  assert.equal(process.env.UMI_TEST_ENV_A, 'nilai-a')
  assert.equal(process.env.UMI_TEST_ENV_B, undefined, 'nilai kosong tidak mengisi env')
  assert.equal(result.loaded, 1)
})

test('tidak menimpa env yang sudah diisi panel', () => {
  process.env.UMI_TEST_ENV_C = 'dari-panel'
  const file = tempEnvFile('UMI_TEST_ENV_C=dari-file\n')
  loadPlatformEnv(file)
  assert.equal(process.env.UMI_TEST_ENV_C, 'dari-panel')
  delete process.env.UMI_TEST_ENV_C
})

test('berkas tidak ada tidak melempar dan tidak mengubah apa pun', () => {
  const result = loadPlatformEnv('/tmp/tidak-ada-file-platform-env-xyz')
  assert.equal(result.loaded, 0)
})

test('tanda kutip di sekitar nilai dilepas', () => {
  delete process.env.UMI_TEST_ENV_D
  const file = tempEnvFile('UMI_TEST_ENV_D="nilai d"\n')
  loadPlatformEnv(file)
  assert.equal(process.env.UMI_TEST_ENV_D, 'nilai d')
  delete process.env.UMI_TEST_ENV_D
})
