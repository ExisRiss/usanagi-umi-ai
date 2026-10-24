/* By AlzRiss - Usanagi Umi AI */

function rupiah(amount) {
  return `${Math.max(0, Math.floor(amount)).toLocaleString('id-ID')} koin`
}

function number(amount) {
  return Math.max(0, Math.floor(amount)).toLocaleString('id-ID')
}

function formatTimer(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}j ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}d`
  return `${seconds}d`
}

function formatRpgText(value) {
  if (typeof value !== 'string') return value
  const source = value.replace(/\r/g, '').trim()
  if (!source) return ''
  const raw = source.split('\n').map((line) => line.replace(/[ \t]+$/g, '').trim())
  const lines = []
  let pendingBlank = false
  for (const rawLine of raw) {
    const line = rawLine.replace(/[━─═_]{4,}/g, '').trim()
    if (!line) {
      if (lines.length) pendingBlank = true
      continue
    }
    if (pendingBlank && lines.length && lines.at(-1) !== '') lines.push('')
    pendingBlank = false
    const isWrappedData = /^\[[^\]]*\]$/.test(line)
    const parts = isWrappedData ? [line] : line.split(/\s+[·•|]\s+/).map((item) => item.trim()).filter(Boolean)
    if (parts.length >= 2 && parts.length <= 6 && !/^https?:\/\//i.test(line)) lines.push(...parts)
    else lines.push(line)
  }
  const out = []
  let firstContent = true
  const titlePattern = /^(?:\p{Extended_Pictographic}\s*)?\*{1,3}[^*\n]{2,48}\*{1,3}$/u
  const namedTitle = /^(?:RPG|SHOP|TRAINING|BATTLE|QUEST|INVENTORY|PROFILE|ADVENTURE|SLOT|PARKIR|HUNTING|FISHING|MINING|FARMING|GUILD|PET|TREASURE|WORK|BANK|MARKET|CRAFT|ALCHEMY|COOKING|WOODCUT|LEADERBOARD|EXPEDITION)\b/i
  const instructionPair = /^\s*(Beli|Jual|Gunakan|Ketik|Contoh|Format|Pilih|Masukkan|Reply|Tujuan|Aksi|Perintah|Claim|Take|Sell|Buy)\s*:\s*(.+)$/i
  const bullet = /^(?:[-*•▪▫◦‣▸►→›]\s|\d+[.)]\s)/
  const stripMarks = (line) => {
    let result = String(line || '').trim()
    result = result.replace(/^\p{Extended_Pictographic}\s*/u, '').trim()
    result = result.replace(/^\*+|\*+$/g, '').trim()
    result = result.replace(/^\p{Extended_Pictographic}\s*/u, '').trim()
    return result
  }
  for (const line of lines) {
    if (!line) {
      if (out.length && out.at(-1) !== '') out.push('')
      continue
    }
    const plain = stripMarks(line)
    if (firstContent) {
      const isTitle = titlePattern.test(line) || namedTitle.test(plain)
      const isInstruction = instructionPair.test(plain) || /^\s*(?:contoh|format|beli|jual|gunakan|ketik|pilih|masukkan)\b/i.test(plain)
      if (isTitle && !isInstruction) {
        out.push(`〔 ${plain} 〕`)
        firstContent = false
        continue
      }
      firstContent = false
    }
    const pair = line.match(instructionPair)
    if (pair) {
      out.push(`• ${pair[1][0].toUpperCase()}${pair[1].slice(1).toLowerCase()}`)
      out.push(`  › ${pair[2].trim()}`)
      continue
    }
    if (bullet.test(line)) {
      out.push(line.replace(/^[▪▫◦‣▸►→]/, '›'))
      continue
    }
    if (/^`[^`]+`$/.test(line)) {
      out.push(`› ${line}`)
      continue
    }
    out.push(`• ${line}`)
  }
  while (out[0] === '') out.shift()
  while (out.at(-1) === '') out.pop()
  return out.join('\n')
}

export { rupiah, number, formatTimer, formatRpgText }

export default { rupiah, number, formatTimer, formatRpgText }
