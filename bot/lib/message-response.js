/* By AlzRiss - Usanagi Umi AI */

/**
 * Mengambil command ID dari balasan tombol, list, template, atau native flow.
 * Fungsi ini sengaja dependency-free agar aman dipakai serializer dan plugin.
 */
export function extractSelectionId(message = {}) {
  const direct =
    message?.selectedButtonId ||
    message?.singleSelectReply?.selectedRowId ||
    message?.selectedId

  if (typeof direct === 'string' && direct) return direct

  const paramsJson = message?.nativeFlowResponseMessage?.paramsJson
  if (!paramsJson) return ''

  try {
    const params = JSON.parse(paramsJson)
    return typeof params?.id === 'string' ? params.id : ''
  } catch {
    return ''
  }
}

export default { extractSelectionId }
