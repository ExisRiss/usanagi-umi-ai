/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import chokidar from 'chokidar'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = path.join(__dirname, '..', 'plugins')

export const pluginStore = new Map()

function isValidPlugin(mod) {
  const handler = mod?.default
  return typeof handler === 'function' && (handler.command || handler.help)
}

function categoryFromPath(relativePath) {
  const segments = relativePath.split(path.sep)
  return segments.length > 1 ? segments[0].toLowerCase() : 'umum'
}

async function loadOneFile(absPath) {
  const relativePath = path.relative(PLUGIN_ROOT, absPath)
  try {
    const url = `${pathToFileURL(absPath).href}?update=${Date.now()}`
    const mod = await import(url)

    if (!isValidPlugin(mod)) {
      logSkip(relativePath, 'tidak mengekspor handler yang valid')
      return
    }

    const handler = mod.default
    handler.category = handler.category || categoryFromPath(relativePath)
    handler.filePath = absPath

    pluginStore.set(relativePath, handler)
    return handler
  } catch (err) {
    logSkip(relativePath, err.message)
  }
}

function logSkip(relativePath, reason) {
  console.log(`  \x1b[33m⚠\x1b[0m  Plugin dilewati: ${relativePath} (${reason})`)
}

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

export async function loadAllPlugins() {
  pluginStore.clear()
  await fs.ensureDir(PLUGIN_ROOT)

  const files = await walkDir(PLUGIN_ROOT)
  let loaded = 0

  for (const file of files) {
    const result = await loadOneFile(file)
    if (result) loaded++
  }

  return { total: files.length, loaded }
}

export function watchPlugins({ onReload } = {}) {
  const watcher = chokidar.watch(PLUGIN_ROOT, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  })

  watcher.on('add', async (file) => {
    if (!file.endsWith('.js')) return
    await loadOneFile(file)
    onReload?.('added', path.relative(PLUGIN_ROOT, file))
  })

  watcher.on('addDir', async (dir) => {
    if (dir === PLUGIN_ROOT) return
    const files = await walkDir(dir)
    for (const file of files) {
      await loadOneFile(file)
    }
    if (files.length) {
      onReload?.('folder-baru', path.relative(PLUGIN_ROOT, dir))
    }
  })

  watcher.on('change', async (file) => {
    if (!file.endsWith('.js')) return
    await loadOneFile(file)
    onReload?.('changed', path.relative(PLUGIN_ROOT, file))
  })

  watcher.on('unlink', (file) => {
    if (!file.endsWith('.js')) return
    const relativePath = path.relative(PLUGIN_ROOT, file)
    pluginStore.delete(relativePath)
    onReload?.('removed', relativePath)
  })

  return watcher
}

export function findPluginByCommand(commandText) {
  for (const handler of pluginStore.values()) {
    if (handler.disabled) continue

    if (handler.command instanceof RegExp) {
      handler.command.lastIndex = 0
      if (handler.command.test(commandText)) return handler
      handler.command.lastIndex = 0
    }

    if (typeof handler.command === 'string' && handler.command === commandText) {
      return handler
    }

    if (Array.isArray(handler.help) && handler.help.includes(commandText)) {
      return handler
    }
  }
  return null
}

export function getCommandEntries() {
  const entries = []
  for (const handler of pluginStore.values()) {
    if (handler.disabled) continue

    const declared = []
    const help = Array.isArray(handler.help) ? handler.help : [handler.help]
    const menuHelp = Array.isArray(handler.menuHelp) ? handler.menuHelp : [handler.menuHelp]

    for (const command of [...help, ...menuHelp]) {
      if (typeof command === 'string') declared.push(command)
    }

    if (typeof handler.command === 'string') {
      declared.push(handler.command)
    }

    if (handler.command instanceof RegExp) {
      const source = handler.command.source
        .replace(/^\^/, '')
        .replace(/\$$/, '')
        .replace(/\(\?:/g, '(')
        .replace(/[()]/g, '')
      if (/^[a-z0-9_-]+(?:\|[a-z0-9_-]+)*$/i.test(source)) {
        declared.push(...source.split('|'))
      }
    }

    for (const command of declared) {
      const normalized = command.trim().toLowerCase()
      if (!normalized) continue
      entries.push({
        command: normalized,
        plugin: handler,
        category: handler.category || 'umum',
      })
    }
  }
  return entries
}

export function getAllCategories() {
  const categories = new Set()
  for (const handler of pluginStore.values()) {
    if (!handler.disabled && !handler.hiddenFromCategory) categories.add(handler.category || 'umum')
  }
  return [...categories]
}

export function getPluginsByCategory(category) {
  const key = String(category || '').trim().toLowerCase()
  return [...pluginStore.values()].filter(
    (handler) => !handler.disabled && String(handler.category || 'umum').trim().toLowerCase() === key
  )
}

export default {
  pluginStore,
  loadAllPlugins,
  watchPlugins,
  findPluginByCommand,
  getCommandEntries,
  getAllCategories,
  getPluginsByCategory,
}
