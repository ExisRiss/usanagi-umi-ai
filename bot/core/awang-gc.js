/* By AlzRiss - Usanagi Umi AI */

import { getAccessModeState, setAccessMode, ACCESS_MODES } from './awang-mode.js'

export function isOnlyGcActive() {
  return getAccessModeState().mode === ACCESS_MODES.ONLY_GC
}

export function setOnlyGcActive(enabled) {
  const state = getAccessModeState()
  const mode = enabled ? ACCESS_MODES.ONLY_GC : state.mode === ACCESS_MODES.ONLY_GC ? ACCESS_MODES.NORMAL : state.mode
  return setAccessMode(mode)
}

export default {
  isOnlyGcActive,
  setOnlyGcActive,
}
