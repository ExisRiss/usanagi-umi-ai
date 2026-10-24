/* By AlzRiss - Usanagi Umi AI */

function asText(value) {
  return typeof value === 'string' ? value : ''
}

/**
 * Separates an incoming command from its argument text without discarding
 * formatting. In addition to whitespace, an ASCII command may be followed
 * immediately by decorative characters such as 「 or a newline.
 *
 * Examples:
 *   setwelcome Halo @user   -> command: setwelcome, text: Halo @user
 *   setwelcome「INTRO」@user -> command: setwelcome, text: 「INTRO」@user
 */
export function parseCommandInput(value) {
  const source = asText(value).trimStart()
  if (!source) return { command: '', args: [], text: '', rawArguments: '' }

  // Bot commands are normally ASCII words, digits, hyphens, or underscores.
  // Parse that stable part first so presentation characters that immediately
  // follow the command are kept in the custom text rather than treated as the
  // command name. Symbol-first legacy commands (for example +prem) retain the
  // original whitespace-token behavior below.
  const asciiCommand = source.match(/^([a-z0-9_-]+)/i)
  if (asciiCommand) {
    const command = asciiCommand[1].toLowerCase()
    const rawArguments = source.slice(asciiCommand[1].length)
    const text = rawArguments.trim()
    return {
      command,
      args: text ? text.split(/\s+/).filter(Boolean) : [],
      text,
      rawArguments,
    }
  }

  const tokens = source.split(/\s+/)
  const command = String(tokens.shift() || '').toLowerCase()
  const text = tokens.join(' ').trim()
  return {
    command,
    args: text ? text.split(/\s+/).filter(Boolean) : [],
    text,
    rawArguments: text,
  }
}

export default { parseCommandInput }
