
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TYPO_ASSET = path.join(__dirname, '..', 'assets', 'image', 'dok.jpg')

export function getTypoDocumentAsset() {
  return fs.existsSync(TYPO_ASSET) ? TYPO_ASSET : null
}

export default { getTypoDocumentAsset }
