/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { findPluginByCommand, getCommandEntries } from './awang-loader.js'
import { sendInteractive } from '../lib/awang-tombol.js'
import { getTypoDocumentAsset } from './awang-canvas.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TYPO_DOCUMENT = path.join(__dirname, '..', 'package.json')
const TYPO_CACHE_TTL = 2500
const MAX_SUGGESTIONS = 3
const PRIMARY_PREFERENCE_MARGIN = 0.06
const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const keyboardNeighbors = new Map()

for (let rowIndex = 0; rowIndex < keyboardRows.length; rowIndex++) {
  const row = keyboardRows[rowIndex]
  for (let index = 0; index < row.length; index++) {
    const key = row[index]
    const neighbors = new Set()
    for (let r = Math.max(0, rowIndex - 1); r <= Math.min(keyboardRows.length - 1, rowIndex + 1); r++) {
      const target = keyboardRows[r]
      const start = Math.max(0, index - 1)
      const end = Math.min(target.length - 1, index + 1)
      for (let i = start; i <= end; i++) if (target[i] !== key) neighbors.add(target[i])
    }
    keyboardNeighbors.set(key, neighbors)
  }
}

function normalizeCommand(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
}

function compactCommand(value) {
  return normalizeCommand(value).replace(/[-_]/g, '')
}

function maxDistanceForLength(length) {
  if (length <= 2) return 1
  if (length <= 4) return 1
  if (length <= 7) return 2
  if (length <= 11) return 3
  return 4
}

function minScoreForLength(length) {
  if (length <= 2) return 1.01
  if (length <= 3) return 0.84
  if (length <= 4) return 0.80
  if (length <= 6) return 0.75
  if (length <= 9) return 0.70
  if (length <= 12) return 0.66
  return 0.63
}

function minEditForLength(length) {
  if (length <= 4) return 0.70
  if (length <= 7) return 0.60
  if (length <= 11) return 0.55
  return 0.50
}

function maxScoreGapForLength(length) {
  if (length <= 4) return 0.10
  if (length <= 7) return 0.14
  return 0.18
}

function damerauLevenshtein(a, b, limit = Infinity) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  if (Math.abs(a.length - b.length) > limit) return limit + 1

  const previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  let prevPrev = null
  let prev = previous

  for (let i = 1; i <= a.length; i++) {
    const current = new Array(b.length + 1)
    current[0] = i

    for (let j = 1; j <= b.length; j++) {
      let value = Math.min(
        prev[j] + 1,
        current[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )

      if (i > 1 && j > 1 && prevPrev && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prevPrev[j - 2] + 1)
      }

      current[j] = value
    }

    prevPrev = prev
    prev = current
  }

  const distance = prev[b.length]
  return distance > limit ? limit + 1 : distance
}

function diceSimilarity(a, b) {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const counts = new Map()
  for (let i = 0; i < a.length - 1; i++) {
    const pair = a.slice(i, i + 2)
    counts.set(pair, (counts.get(pair) || 0) + 1)
  }

  let overlap = 0
  for (let i = 0; i < b.length - 1; i++) {
    const pair = b.slice(i, i + 2)
    const count = counts.get(pair) || 0
    if (count) {
      overlap++
      counts.set(pair, count - 1)
    }
  }

  return (2 * overlap) / ((a.length - 1) + (b.length - 1))
}

function prefixSimilarity(a, b) {
  let length = 0
  const limit = Math.min(a.length, b.length)
  while (length < limit && a[length] === b[length]) length++
  return length / Math.max(a.length, b.length, 1)
}

function positionalSimilarity(a, b) {
  const limit = Math.min(a.length, b.length)
  if (!limit) return 0
  let matched = 0
  for (let i = 0; i < limit; i++) if (a[i] === b[i]) matched++
  return matched / Math.max(a.length, b.length, 1)
}

function substitutionSimilarity(a, b, distance) {
  if (distance !== 1 || a.length !== b.length || !a.length) return 0
  const positional = positionalSimilarity(a, b)
  return positional >= (a.length <= 4 ? 0.65 : 0.70) ? positional : 0
}

function suffixSimilarity(a, b) {
  let length = 0
  let ai = a.length - 1
  let bi = b.length - 1
  while (ai >= 0 && bi >= 0 && a[ai] === b[bi]) {
    length++
    ai--
    bi--
  }
  return length / Math.max(a.length, b.length, 1)
}

function keyboardSimilarity(a, b) {
  const limit = Math.min(a.length, b.length)
  if (!limit) return 0
  let good = 0
  for (let i = 0; i < limit; i++) {
    if (a[i] === b[i]) {
      good += 1
      continue
    }
    if (keyboardNeighbors.get(b[i])?.has(a[i])) good += 0.72
  }
  return good / Math.max(a.length, b.length)
}

function orderedOverlap(a, b) {
  if (!a || !b) return 0
  let j = 0
  let matched = 0
  for (const char of a) {
    const index = b.indexOf(char, j)
    if (index === -1) continue
    matched++
    j = index + 1
  }
  return matched / Math.max(a.length, b.length, 1)
}

function repeatedCharPenalty(a, b) {
  const collapse = (value) => value.replace(/(.)\1+/g, '$1')
  return 1 - Math.min(1, damerauLevenshtein(collapse(a), collapse(b), 3) / Math.max(collapse(a).length, collapse(b).length, 1))
}

function isAdjacentTransposition(a, b) {
  if (a.length !== b.length) return false
  const differences = []
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) differences.push(i)
  return differences.length === 2 && differences[1] === differences[0] + 1 && a[differences[0]] === b[differences[1]] && a[differences[1]] === b[differences[0]]
}

function resolvePrimaryCommand(plugin, fallback = '') {
  if (Array.isArray(plugin?.help)) {
    for (const value of plugin.help) {
      const normalized = normalizeCommand(value)
      if (normalized) return normalized
    }
  }

  if (typeof plugin?.help === 'string') {
    const normalized = normalizeCommand(plugin.help)
    if (normalized) return normalized
  }

  if (typeof plugin?.command === 'string') {
    const normalized = normalizeCommand(plugin.command)
    if (normalized) return normalized
  }

  return normalizeCommand(fallback)
}

function resolveMenuCommands(plugin) {
  if (!Array.isArray(plugin?.menuHelp)) return []
  return [...new Set(plugin.menuHelp.map((value) => normalizeCommand(value)).filter((value) => value.length >= 2))]
}

function buildEntries(sourceEntries = getCommandEntries()) {
  const entries = sourceEntries
  const byPlugin = new Map()
  const seenByPlugin = new Map()

  for (const entry of entries) {
    const command = normalizeCommand(entry.command)
    const compact = compactCommand(entry.command)
    if (command.length < 2 || compact.length < 2) continue

    let seenCommands = seenByPlugin.get(entry.plugin)
    if (!seenCommands) {
      seenCommands = new Set()
      seenByPlugin.set(entry.plugin, seenCommands)
    }
    if (seenCommands.has(command)) continue

    let activePlugin = null
    try {
      activePlugin = findPluginByCommand(command)
    } catch {
      activePlugin = null
    }
    if (!activePlugin || activePlugin !== entry.plugin) continue

    seenCommands.add(command)

    const key = entry.plugin || command
    let group = byPlugin.get(key)
    if (!group) {
      group = {
        plugin: entry.plugin,
        category: entry.category || 'umum',
        primaryCommand: resolvePrimaryCommand(entry.plugin, command),
        menuCommands: resolveMenuCommands(entry.plugin),
        commands: [],
      }
      byPlugin.set(key, group)
    }

    group.commands.push({
      command,
      compact,
    })
  }

  const result = []

  for (const group of byPlugin.values()) {
    const commandMap = new Map()
    for (const command of group.commands) {
      if (!commandMap.has(command.command)) commandMap.set(command.command, command)
    }

    const allCommands = [...commandMap.values()]
    if (!allCommands.length) continue

    const publicCommands = group.menuCommands.filter((command) => commandMap.has(command))
    const primaryCommand = commandMap.has(group.primaryCommand)
      ? group.primaryCommand
      : publicCommands[0] || allCommands[0].command
    const hiddenVariants = allCommands.filter((entry) => !publicCommands.includes(entry.command))

    if (publicCommands.length) {
      publicCommands.forEach((command, menuOrder) => {
        const isPrimary = command === primaryCommand
        result.push({
          plugin: group.plugin,
          category: group.category,
          primaryCommand: command,
          menuOrder,
          commands: [
            commandMap.get(command),
            ...(isPrimary ? hiddenVariants : []).filter((entry) => entry.command !== command),
          ],
        })
      })
      continue
    }

    result.push({
      plugin: group.plugin,
      category: group.category,
      primaryCommand,
      menuOrder: 0,
      commands: allCommands,
    })
  }

  return result.filter((group) => group.commands.length)
}

let cachedEntries = []
let cachedAt = 0
let cachedRegistrySignature = ''
const pluginTokens = new WeakMap()
let nextPluginToken = 1

function getPluginToken(plugin) {
  if (!plugin || typeof plugin !== 'object') return String(plugin || '')
  let token = pluginTokens.get(plugin)
  if (!token) {
    token = String(nextPluginToken++)
    pluginTokens.set(plugin, token)
  }
  return token
}

function getRegistrySignature(entries) {
  if (!Array.isArray(entries) || !entries.length) return ''
  return entries.map((entry) => `${getPluginToken(entry.plugin)}:${entry.command}:${entry.category || ''}`).join('|')
}

function getEntries() {
  const now = Date.now()
  let sourceEntries

  try {
    sourceEntries = getCommandEntries()
  } catch {
    cachedEntries = []
    cachedAt = now
    cachedRegistrySignature = ''
    return cachedEntries
  }

  const registrySignature = getRegistrySignature(sourceEntries)
  if (registrySignature !== cachedRegistrySignature || now - cachedAt >= TYPO_CACHE_TTL) {
    try {
      cachedEntries = buildEntries(sourceEntries)
      cachedRegistrySignature = registrySignature
    } catch {
      cachedEntries = []
    }
    cachedAt = now
  }

  return cachedEntries
}

function scoreCandidate(input, candidate) {
  const command = input
  const target = candidate.command
  const compactInput = compactCommand(command)
  const compactTarget = candidate.compact
  const prefixMatch = command.length >= 3 && target.length > command.length && target.startsWith(command)
  const typedExtensionMatch = target.length < command.length && command.startsWith(target)
  const maxDistance = maxDistanceForLength(command.length)
  const distance = damerauLevenshtein(command, target, prefixMatch ? Infinity : maxDistance)
  if (distance > maxDistance && !prefixMatch) return null

  const compactDistance = damerauLevenshtein(compactInput, compactTarget, prefixMatch ? Infinity : Math.max(maxDistance, 2))
  if (compactDistance > Math.max(maxDistance, 2) && !prefixMatch) return null

  const maxLength = Math.max(command.length, target.length, 1)
  const edit = 1 - distance / maxLength
  const compactEdit = 1 - compactDistance / Math.max(compactInput.length, compactTarget.length, 1)
  const dice = diceSimilarity(command, target)
  const prefix = prefixSimilarity(command, target)
  const suffix = suffixSimilarity(command, target)
  const keyboard = keyboardSimilarity(command, target)
  const positional = positionalSimilarity(command, target)
  const substitution = substitutionSimilarity(command, target, distance)
  const ordered = orderedOverlap(command, target)
  const repeats = repeatedCharPenalty(command, target)
  const transposition = isAdjacentTransposition(command, target)
  const lengthGap = Math.abs(command.length - target.length)
  const completionRatio = prefixMatch ? command.length / Math.max(target.length, 1) : 0
  const prefixCompletionScore = prefixMatch ? 0.65 + 0.35 * completionRatio : 0

  let score =
    edit * 0.34 +
    compactEdit * 0.09 +
    dice * 0.13 +
    keyboard * 0.09 +
    prefix * 0.08 +
    suffix * 0.04 +
    positional * 0.11 +
    ordered * 0.06 +
    repeats * 0.06

  if (transposition) score += 0.12
  if (substitution) score += 0.08 + substitution * 0.08
  if (lengthGap === 0) score += 0.025
  if (lengthGap > 2) score -= 0.10
  if (distance === 1) score += 0.08
  if (distance === 2 && command.length >= 7) score += 0.025
  if (keyboard > 0.65 && distance <= 2) score += 0.04
  if (typedExtensionMatch) score += 0.14
  if (prefixMatch) score = Math.max(score, prefixCompletionScore)

  return {
    ...candidate,
    distance,
    score: Math.max(0, score),
    edit,
    transposition,
    compactEdit,
    keyboard,
    positional,
    substitution,
    prefix,
    prefixMatch,
    typedExtensionMatch,
    completionRatio,
  }
}

function isRelevantCandidate(command, candidate) {
  if (!candidate || command.length < 3) return false
  if (candidate.score < minScoreForLength(command.length)) return false
  const strongSubstitution = candidate.substitution >= (command.length <= 4 ? 0.65 : 0.70)
  if (!candidate.prefixMatch && !strongSubstitution && candidate.edit < minEditForLength(command.length)) return false
  return true
}

function sortCandidates(a, b) {
  if (b.score !== a.score) return b.score - a.score
  if (a.distance !== b.distance) return a.distance - b.distance
  if (b.edit !== a.edit) return b.edit - a.edit
  if (b.prefix !== a.prefix) return b.prefix - a.prefix
  if (b.keyboard !== a.keyboard) return b.keyboard - a.keyboard
  if (a.primary !== b.primary) return a.primary ? -1 : 1
  if (a.plugin === b.plugin && a.menuOrder !== b.menuOrder) return a.menuOrder - b.menuOrder
  if (a.command.length !== b.command.length) return a.command.length - b.command.length
  return a.command.localeCompare(b.command)
}

function selectGroupCandidate(command, group) {
  const scored = []

  for (const variant of group.commands) {
    if (variant.command === command) continue
    const result = scoreCandidate(command, variant)
    if (!result || !isRelevantCandidate(command, result)) continue
    scored.push({ ...result, primary: variant.command === group.primaryCommand })
  }

  if (!scored.length) return null

  scored.sort(sortCandidates)
  const best = scored[0]
  const primary = scored.find((candidate) => candidate.command === group.primaryCommand)

  if (
    primary &&
    primary.command !== best.command &&
    best.score - primary.score <= PRIMARY_PREFERENCE_MARGIN
  ) {
    return primary
  }

  return best
}

export function findCommandMatches(input, limit = MAX_SUGGESTIONS) {
  const command = normalizeCommand(input)
  const maximum = Math.max(1, Math.min(MAX_SUGGESTIONS, Number(limit) || MAX_SUGGESTIONS))
  if (!command || command.length < 3) return []

  try {
    if (findPluginByCommand(command)) return []
  } catch {
  }

  const entries = getEntries()
  if (!entries.length) return []

  const candidates = []

  for (const group of entries) {
    try {
      const candidate = selectGroupCandidate(command, group)
      if (candidate) {
        candidates.push({
          ...candidate,
          plugin: group.plugin,
          category: group.category,
          primaryCommand: group.primaryCommand,
          menuOrder: group.menuOrder,
        })
      }
    } catch {
    }
  }

  if (!candidates.length) return []

  candidates.sort(sortCandidates)
  const best = candidates[0]
  const bestScore = best.score
  const scoreGap = maxScoreGapForLength(command.length)
  const extensionGap = best.typedExtensionMatch ? 0.05 : scoreGap
  const extensionDominant = best.typedExtensionMatch && command.length <= 7

  return candidates
    .filter((candidate) => {
      const gap = bestScore - candidate.score
      if (gap > extensionGap) return false
      if (extensionDominant && !candidate.typedExtensionMatch && gap < 0.08) return false
      return true
    })
    .slice(0, maximum)
    .map((candidate) => ({
      command: candidate.command,
      distance: candidate.distance,
      similarity: Math.max(0, Math.min(100, Math.round(candidate.edit * 100))),
      score: Math.max(0, Math.min(100, Math.round(candidate.score * 100))),
      plugin: candidate.plugin,
      category: candidate.category,
      primaryCommand: candidate.primaryCommand,
      matchedAsPrimary: candidate.command === candidate.primaryCommand,
      prefixMatch: candidate.prefixMatch,
      typedExtensionMatch: candidate.typedExtensionMatch,
    }))
}

export function findBestCommandMatch(input) {
  return findCommandMatches(input, 1)[0] || null
}

function buildTypoText(prefix, typedCommand, matches) {
  if (matches.length === 1) {
    const suggested = `${prefix}${String(matches[0].command || '').replace(/^\.+/, '')}`
    return [
      '💢 *COMMAND TIDAK DITEMUKAN*',
      '',
      '╭─〔 *MUNGKIN INI* 〕',
      `│ • ${suggested}`,
      `│ • ${matches[0].similarity}% mirip`,
      '╰────────────',
    ].join('\n')
  }

  const suggestions = matches
    .map((match) => `│ • ${prefix}${String(match.command || '').replace(/^\.+/, '')} — ${match.similarity}% mirip`)
    .join('\n')

  return [
    '💢 *COMMAND TIDAK DITEMUKAN*',
    '',
    '╭─〔 *MUNGKIN INI* 〕',
    suggestions,
    '╰────────────',
  ].join('\n')
}

export async function sendTypoSuggestion(conn, raw, chat, prefix, typedCommand) {
  const matches = findCommandMatches(typedCommand, MAX_SUGGESTIONS)
  if (!matches.length) return false

  const teks = buildTypoText(prefix, typedCommand, matches)
  const mentions = raw?.key?.participant ? [raw.key.participant] : []
  const documentBuffer = fs.existsSync(TYPO_DOCUMENT) ? fs.readFileSync(TYPO_DOCUMENT) : null
  const documentThumbnail = getTypoDocumentAsset()
  const options = {
    title: '',
    subtitle: '',
    body: teks,
    footer: '↳ Tekan tombol untuk menjalankan.',
    document: documentBuffer,
    documentFileName: 'Usanagi-Ai MultiDevice',
    documentMimetype: 'application/json',
    documentThumbnail,
    buttons: matches.map((match) => ({
      label: `${prefix}${String(match.command || '').replace(/^\.+/, '')}`,
      command: `${prefix}${String(match.command || '').replace(/^\.+/, '')}`,
    })),
    mentions,
  }

  try {
    await sendInteractive(conn, chat, options, { quoted: raw })
    return true
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  Gagal mengirim saran typo: ${error?.message || error}`)
    try {
      await conn.sendMessage(chat, { text: teks, mentions }, { quoted: raw })
      return true
    } catch (fallbackError) {
      console.log(`  \x1b[31m✗\x1b[0m  Fallback saran typo gagal: ${fallbackError?.message || fallbackError}`)
      return false
    }
  }
}

export default { findCommandMatches, findBestCommandMatch, sendTypoSuggestion }
