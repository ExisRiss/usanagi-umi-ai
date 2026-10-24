/* By AlzRiss - Usanagi Umi AI */

import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { runWorldFeature } from '../../lib/rpg/awang-world.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  return runWorldFeature(m, sock, 'insurance')
}

handler.command = /^insurance$/i
handler.help = ['insurance']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Fitur RPG insurance'

export default handler
