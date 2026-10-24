/* By AlzRiss - Usanagi Umi AI */

const tails = new Map()

async function withRpgLocks(keys, task) {
  const lockKeys = [...new Set((Array.isArray(keys) ? keys : [keys]).map((value) => String(value || '')).filter(Boolean))].sort()
  const releases = []

  for (const key of lockKeys) {
    const previous = tails.get(key) || Promise.resolve()
    let releaseCurrent
    const current = new Promise((resolve) => {
      releaseCurrent = resolve
    })
    tails.set(key, current)
    await previous
    releases.push(() => {
      releaseCurrent()
      if (tails.get(key) === current) tails.delete(key)
    })
  }

  try {
    return await task()
  } finally {
    for (let i = releases.length - 1; i >= 0; i--) releases[i]()
  }
}

export { withRpgLocks }
export default { withRpgLocks }
