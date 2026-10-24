
import crypto from 'node:crypto'

const TYPE_MAP = Object.freeze({
  0: 'DEFAULT',
  1: 'KEYWORD',
  2: 'METHOD',
  3: 'STR',
  4: 'NUMBER',
  5: 'COMMENT',
})

const KEYWORDS = {
  javascript: new Set('break case catch continue debugger delete do else finally for function if in instanceof new return switch this throw try typeof var void while with true false null undefined class const let super extends export import yield static constructor async await get set'.split(/\s+/)),
  typescript: new Set('abstract any as asserts bigint boolean declare enum implements infer interface is keyof module namespace never readonly require number object override private protected public satisfies string symbol type unknown using from break case catch continue do else finally for function if new return switch this throw try var void while class const let extends import export async await'.split(/\s+/)),
  python: new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(/\s+/)),
  java: new Set('abstract assert boolean break byte case char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while'.split(/\s+/)),
  golang: new Set('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var'.split(/\s+/)),
  c: new Set('auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while'.split(/\s+/)),
  cpp: new Set('alignas alignof and auto bool break case catch class const constexpr continue delete do double else enum explicit export extern false float for friend if inline int long mutable namespace new noexcept nullptr operator private protected public return short signed sizeof static struct switch template this throw true try typedef typename union unsigned using virtual void while'.split(/\s+/)),
  php: new Set('abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile extends final finally fn for foreach function global goto implements include include_once instanceof interface match namespace new null or private protected public require require_once return static switch throw trait try use var while yield'.split(/\s+/)),
  rust: new Set('as break const continue crate else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while'.split(/\s+/)),
  html: new Set('html head body div span p a img video audio script style link meta form input button table tr td th ul ol li section article header footer nav main'.split(/\s+/)),
  bash: new Set('if then else elif fi for while do done case esac function in select until break continue return export readonly local declare'.split(/\s+/)),
  markdown: new Set('# ## ### #### ##### ######'.split(/\s+/)),
}

function normalizeLanguage(language = 'text') {
  const value = String(language || 'text').trim().toLowerCase()
  const aliases = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    py: 'python',
    go: 'golang',
    golang: 'golang',
    cxx: 'cpp',
    h: 'c',
    hpp: 'cpp',
    sh: 'bash',
    shell: 'bash',
    txt: 'text',
    plaintext: 'text',
  }
  return aliases[value] || value || 'text'
}

function tokenize(code, language = 'javascript') {
  const lang = normalizeLanguage(language)
  if (lang === 'text') {
    return {
      codeBlock: [{ codeContent: code, highlightType: 0 }],
      unifiedCodeBlock: [{ content: code, type: 'DEFAULT' }],
    }
  }

  const keywords = KEYWORDS[lang] || new Set()
  const tokens = []
  const push = (content, type) => {
    if (!content) return
    const last = tokens[tokens.length - 1]
    if (last && last.highlightType === type) {
      last.codeContent += content
      return
    }
    tokens.push({ codeContent: content, highlightType: type })
  }

  const identifierPattern = lang === 'css'
    ? /[a-zA-Z0-9_$-]/
    : lang === 'html'
      ? /[a-zA-Z0-9_$:-]/
      : /[a-zA-Z0-9_$]/

  let i = 0
  while (i < code.length) {
    const c = code[i]

    if (/\s/.test(c)) {
      const start = i
      while (i < code.length && /\s/.test(code[i])) i++
      push(code.slice(start, i), 0)
      continue
    }

    if ((c === '/' && code[i + 1] === '/') || (c === '#' && ['python', 'bash'].includes(lang))) {
      const start = i
      while (i < code.length && code[i] !== '\n') i++
      push(code.slice(start, i), 5)
      continue
    }

    if (c === '/' && code[i + 1] === '*') {
      const start = i
      i += 2
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++
      if (i < code.length) i += 2
      push(code.slice(start, i), 5)
      continue
    }

    if (c === '"' || c === "'" || c === '`') {
      const start = i
      const quote = c
      i++
      while (i < code.length) {
        if (code[i] === '\\' && i + 1 < code.length) {
          i += 2
        } else if (code[i] === quote) {
          i++
          break
        } else {
          i++
        }
      }
      push(code.slice(start, i), 3)
      continue
    }

    if (/[0-9]/.test(c)) {
      const start = i
      while (i < code.length && /[0-9._]/.test(code[i])) i++
      push(code.slice(start, i), 4)
      continue
    }

    if (/[a-zA-Z_$]/.test(c)) {
      const start = i
      while (i < code.length && identifierPattern.test(code[i])) i++
      const word = code.slice(start, i)
      let type = 0

      if (keywords.has(word)) {
        type = 1
      } else if (lang === 'css') {
        let j = i
        while (j < code.length && /\s/.test(code[j])) j++
        if (code[j] === ':') type = 1
      } else if (lang === 'html') {
        let j = start - 1
        while (j >= 0 && /\s/.test(code[j])) j--
        if (code[j] === '<' || (code[j] === '/' && code[j - 1] === '<')) type = 1
      }

      if (type === 0) {
        let j = i
        while (j < code.length && /\s/.test(code[j])) j++
        if (code[j] === '(') type = 2
      }

      push(word, type)
      continue
    }

    push(c, 0)
    i++
  }

  return {
    codeBlock: tokens,
    unifiedCodeBlock: tokens.map(token => ({
      content: token.codeContent,
      type: TYPE_MAP[token.highlightType],
    })),
  }
}

function extractInlineEntities(text) {
  const source = String(text || '')
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
  const inlineEntities = []
  let result = ''
  let lastIndex = 0
  let index = 0
  let match

  while ((match = pattern.exec(source))) {
    const [raw, displayName, url] = match
    const key = `ALZRISS_HYPERLINK_${index++}`
    result += source.slice(lastIndex, match.index)
    result += `{{${key}}}${url}{{/${key}}}`
    inlineEntities.push({
      key,
      metadata: {
        display_name: displayName,
        is_trusted: true,
        url,
        __typename: 'GenAIInlineLinkItem',
      },
    })
    lastIndex = match.index + raw.length
  }

  result += source.slice(lastIndex)
  return { text: result, inlineEntities }
}

function normalizeInlineMarkdown(text) {
  const boldToken = 'ALZRISS_BOLD_TOKEN_7F3A9C'
  return String(text || '')
    .replace(/\*{3}([^*\n]+)\*{3}/g, `${boldToken}$1${boldToken}`)
    .replace(/\*{2}([^*\n]+)\*{2}/g, `${boldToken}$1${boldToken}`)
    .replace(/_{2}([^_\n]+)_{2}/g, `${boldToken}$1${boldToken}`)
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1 ($2)')
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1$2')
    .replace(/(^|\s)~([^~\n]+)~(?=\s|$)/g, '$1$2')
    .replace(/~~([^~\n]+)~~/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(new RegExp(boldToken, 'g'), '*')
}

function cleanTableCell(value) {
  return String(value ?? '')
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/\*{3}([^*\n]+)\*{3}/g, '$1')
    .replace(/\*{2}([^*\n]+)\*{2}/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1$2')
    .replace(/(^|\s)~([^~\n]+)~(?=\s|$)/g, '$1$2')
    .replace(/~~([^~\n]+)~~/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function getTextLineKind(line) {
  const value = String(line || '').trim()
  if (!value) return 'blank'
  if (/^#{1,6}\s+/.test(value)) return 'heading'
  if (/^[-*+]\s+/.test(value) || /^\d+[.)]\s+/.test(value)) return 'list'
  if (/^>\s?/.test(value)) return 'quote'
  if (/^(?:[-*_]){3,}$/.test(value)) return 'divider'
  return 'paragraph'
}

function normalizeTextAtom(value, { preserveHeading = false } = {}) {
  let line = String(value || '').replace(/[ \t]+/g, ' ').trim()
  if (!line) return ''
  const heading = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/)
  if (heading) {
    const headingText = normalizeInlineMarkdown(heading[1]).replace(/[*_~`]+/g, '').trim()
    return preserveHeading && headingText ? `*${headingText}*` : headingText
  }
  return normalizeInlineMarkdown(line).trim()
}

function buildTextUnits(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n')
  const units = []
  let buffer = []
  let explicitDivider = false
  let previousKind = null

  const pushParagraph = () => {
    if (!buffer.length) return
    const normalizedLines = buffer.map(line => normalizeTextAtom(line)).filter(Boolean)
    if (!normalizedLines.length) {
      buffer = []
      return
    }
    units.push({ type: 'paragraph', lines: normalizedLines })
    buffer = []
  }

  const pushList = (kind) => {
    const normalizedLines = buffer.map(line => {
      const source = String(line || '').trim()
      const unordered = source.match(/^[-*+]\s+(.+)$/)
      const ordered = source.match(/^(\d+)[.)]\s+(.+)$/)
      if (kind === 'unordered' && unordered) return `• ${normalizeTextAtom(unordered[1])}`
      if (kind === 'ordered' && ordered) return `${ordered[1]}. ${normalizeTextAtom(ordered[2])}`
      return normalizeTextAtom(source)
    }).filter(Boolean)
    if (normalizedLines.length) units.push({ type: 'list', lines: normalizedLines })
    buffer = []
  }

  const pushQuote = () => {
    const normalizedLines = buffer.map(line => normalizeTextAtom(String(line || '').replace(/^>\s?/, ''))).filter(Boolean)
    if (normalizedLines.length) units.push({ type: 'quote', lines: normalizedLines.map(line => `│ ${line}`) })
    buffer = []
  }

  const pushByKind = kind => {
    if (kind === 'unordered' || kind === 'ordered') pushList(kind)
    else if (kind === 'quote') pushQuote()
    else pushParagraph()
  }

  for (const rawLine of lines) {
    const line = String(rawLine || '').replace(/[ \t]+$/g, '').trim()
    if (!line) {
      pushByKind(previousKind === 'unordered' || previousKind === 'ordered' || previousKind === 'quote' ? previousKind : 'paragraph')
      previousKind = null
      continue
    }

    const kind = getTextLineKind(line)
    if (kind === 'divider') {
      pushByKind(previousKind === 'unordered' || previousKind === 'ordered' || previousKind === 'quote' ? previousKind : 'paragraph')
      explicitDivider = true
      previousKind = null
      continue
    }

    if (kind === 'heading') {
      pushByKind(previousKind === 'unordered' || previousKind === 'ordered' || previousKind === 'quote' ? previousKind : 'paragraph')
      const headingText = normalizeTextAtom(line, { preserveHeading: true })
      if (headingText) units.push({ type: 'heading', lines: [headingText] })
      previousKind = null
      continue
    }

    if (kind === 'list') {
      const listKind = /^\d+[.)]\s+/.test(line) ? 'ordered' : 'unordered'
      if (previousKind && previousKind !== listKind) pushByKind(previousKind)
      buffer.push(line)
      previousKind = listKind
      continue
    }

    if (kind === 'quote') {
      if (previousKind && previousKind !== 'quote') pushByKind(previousKind)
      buffer.push(line)
      previousKind = 'quote'
      continue
    }

    if (previousKind && previousKind !== 'paragraph') pushByKind(previousKind)
    buffer.push(line)
    previousKind = 'paragraph'
  }

  pushByKind(previousKind === 'unordered' || previousKind === 'ordered' || previousKind === 'quote' ? previousKind : 'paragraph')
  return { units: compactTextUnits(units), explicitDivider }
}

function compactTextUnits(units) {
  const result = []
  for (let index = 0; index < units.length; index++) {
    const current = units[index]
    const next = units[index + 1]
    if (!next) {
      result.push(current)
      continue
    }

    if (current.type === 'heading' && ['paragraph', 'list', 'quote'].includes(next.type)) {
      result.push({ type: 'section', lines: [...current.lines, ...next.lines] })
      index++
      continue
    }

    const singleOrdered = current.type === 'list' && current.lines.length === 1 && /^\d+\.\s+/.test(current.lines[0])
    if (singleOrdered && next.type === 'paragraph') {
      result.push({ type: 'section', lines: [...current.lines, ...next.lines] })
      index++
      continue
    }

    if (current.type === 'paragraph' && next.type === 'list' && /[:;]$/.test(current.lines[current.lines.length - 1])) {
      result.push({ type: 'section', lines: [...current.lines, ...next.lines] })
      index++
      continue
    }

    result.push(current)
  }
  return result
}

function chooseDivider() {
  const options = ['────────────', '┈┈┈┈┈┈┈┈┈┈', '╭──────────╮']
  return options[crypto.randomInt(0, options.length)]
}

function shouldInsertDivider(units, explicitDivider) {
  if (units.length < 3) return false
  const chance = explicitDivider ? 34 : 16
  return crypto.randomInt(1, 101) <= chance
}

function renderTextUnits(units, explicitDivider) {
  if (!units.length) return ''
  const dividerEnabled = shouldInsertDivider(units, explicitDivider)
  let dividerIndex = -1
  if (dividerEnabled) {
    const candidates = units
      .map((unit, index) => ({ unit, index }))
      .filter(({ unit, index }) => index > 0 && (unit.type === 'heading' || unit.type === 'list' || unit.type === 'quote'))
      .map(item => item.index)
    const fallback = units.map((_, index) => index).filter(index => index > 0)
    const pool = candidates.length ? candidates : fallback
    dividerIndex = pool[crypto.randomInt(0, pool.length)]
  }

  const rendered = []
  units.forEach((unit, index) => {
    const content = unit.lines.join('\n').trim()
    if (!content) return
    if (dividerIndex === index) rendered.push(chooseDivider())
    rendered.push(content)
  })

  return rendered.join('\n\n').replace(/(?:\n[ \t]*){3,}/g, '\n\n').trim()
}

function normalizeTextLayout(text) {
  return renderTextUnits(...(() => {
    const result = buildTextUnits(text)
    return [result.units, result.explicitDivider]
  })())
}

function composeTextBlocks(text) {
  const unitsData = buildTextUnits(text)
  if (!unitsData.units.length) return []
  const rendered = renderTextUnits(unitsData.units, unitsData.explicitDivider)
  if (!rendered) return []
  return [{ type: 'paragraph', text: rendered }]
}

function normalizeTable(table) {
  if (!Array.isArray(table) || !table.length || !table.every(row => Array.isArray(row))) {
    throw new TypeError('Table harus berupa array berisi array')
  }

  const maxColumns = Math.max(1, ...table.map(row => row.length))
  const rows = table.map(row => Array.from({ length: maxColumns }, (_, index) => cleanTableCell(row[index] ?? '')))
  const [header, ...body] = rows
  return [
    { is_header: true, cells: header },
    ...body.map(cells => ({ is_header: false, cells })),
  ]
}

function buildLayout(primitive) {
  return {
    view_model: {
      primitive,
      __typename: 'GenAISingleLayoutViewModel',
    },
  }
}

function buildTextSection(text) {
  const extracted = extractInlineEntities(text)
  return buildLayout({
    text: extracted.text,
    ...(extracted.inlineEntities.length ? { inline_entities: extracted.inlineEntities } : {}),
    __typename: 'GenAIMarkdownTextUXPrimitive',
  })
}

function buildCodeSection(language, code) {
  const meta = tokenize(code, language)
  return buildLayout({
    language: String(language || 'text'),
    code_blocks: meta.unifiedCodeBlock,
    __typename: 'GenAICodeUXPrimitive',
  })
}

function buildTableSection(table) {
  return buildLayout({
    rows: normalizeTable(table),
    __typename: 'GenATableUXPrimitive',
  })
}

function normalizeMarkdownForUnifiedText(text) {
  return String(text || '')
    .replace(/\*{4,}([^\n*]+)\*{4,}/g, '**$1**')
    .replace(/_{4,}([^\n_]+)_{4,}/g, '__$1__')
    .replace(/~{3,}([^\n~]+)~{3,}/g, '~~$1~~')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildQuotedContext(quoted) {
  if (!quoted?.key) return {}
  return {
    stanzaId: quoted.key.id || quoted.id,
    participant: quoted.key.participant || quoted.key.remoteJid || quoted.sender,
    quotedType: 0,
    quotedMessage: quoted.message ?? quoted,
  }
}

class UsanagiAIRich {
  constructor(client, { title = 'Usanagi Umi AI' } = {}) {
    if (!client?.relayMessage) throw new TypeError('Connection relayMessage tidak tersedia')
    this.client = client
    this.title = String(title || 'Usanagi Umi AI')
    this.submessages = []
    this.sections = []
  }

  addText(text) {
    if (typeof text !== 'string') throw new TypeError('Text harus berupa string')
    const blocks = composeTextBlocks(text)
    if (!blocks.length) return this

    const messageText = blocks
      .map(block => block.text.trim())
      .filter(Boolean)
      .join('\n')
      .trim()

    if (!messageText) return this

    this.submessages.push({
      messageType: 2,
      messageText,
    })

    const extracted = extractInlineEntities(messageText)
    this.sections.push(buildLayout({
      text: extracted.text,
      ...(extracted.inlineEntities.length ? { inline_entities: extracted.inlineEntities } : {}),
      __typename: 'GenAIMarkdownTextUXPrimitive',
    }))

    return this
  }

  addCode(language, code) {
    if (typeof language !== 'string' || typeof code !== 'string') {
      throw new TypeError('Language dan code harus berupa string')
    }
    const normalizedLanguage = normalizeLanguage(language)
    const sourceCode = String(code)
    if (!sourceCode.length) return this
    const meta = tokenize(sourceCode, normalizedLanguage)
    this.submessages.push({
      messageType: 5,
      codeMetadata: {
        codeLanguage: normalizedLanguage,
        codeBlocks: meta.codeBlock,
      },
    })
    this.sections.push(buildCodeSection(normalizedLanguage, sourceCode))
    return this
  }

  addTable(table) {
    const unifiedRows = normalizeTable(table)
    this.submessages.push({
      messageType: 4,
      tableMetadata: {
        title: '',
        rows: unifiedRows.map(row => ({
          items: row.cells,
          ...(row.is_header ? { isHeading: true } : {}),
        })),
      },
    })
    this.sections.push(buildLayout({
      rows: unifiedRows,
      __typename: 'GenATableUXPrimitive',
    }))
    return this
  }

  async send(jid, { quoted = null, forwarded = true, ...options } = {}) {
    if (!this.submessages.length) {
      throw new Error('Rich response tidak memiliki konten')
    }

    const contextInfo = {
      ...(forwarded
        ? {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: {
              botJid: '867051314767696@bot',
            },
            forwardOrigin: 4,
          }
        : {}),
      ...buildQuotedContext(quoted),
    }

    const responseId = `3EB0${crypto.randomBytes(18).toString('hex').toUpperCase()}`
    const message = {
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: this.submessages,
            contextInfo,
          },
        },
      },
    }

    await this.client.relayMessage(jid, message, { messageId: responseId, ...options })
    return { message, responseId }
  }
}

export { UsanagiAIRich, tokenize, normalizeTable, buildTextSection, buildCodeSection, buildTableSection }
export default UsanagiAIRich
