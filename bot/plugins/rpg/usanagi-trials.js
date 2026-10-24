/* By AlzRiss - Usanagi Umi AI */

import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { runWorldFeature } from '../../lib/rpg/awang-world.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  return runWorldFeature(m, sock, 'trials')
}

handler.command = /^trials$/i
handler.help = ['trials']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Fitur RPG trials'

export default handler
