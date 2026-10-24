/* By AlzRiss - Usanagi Umi AI */

import { settings } from '../config/settings.js'

export const CREATOR_NAME = 'AlzRiss'
export const PROJECT_NAME = 'Usanagi Umi AI'
export const PROJECT_YEAR = settings.footerYear || '2026'

export function creatorWatermark() {
  return global.brandCredit || 'By AlzRiss - Usanagi Umi AI'
}

export default {
  CREATOR_NAME,
  PROJECT_NAME,
  PROJECT_YEAR,
  creatorWatermark,
}
