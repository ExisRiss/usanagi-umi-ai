/* By AlzRiss - Usanagi Umi AI */

import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { runWorldFeature } from '../../lib/rpg/awang-world.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  return runWorldFeature(m, sock, 'archaeology')
}

handler.command = /^archaeology$/i
handler.help = ['archaeology']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Fitur RPG archaeology'

export default handler
