/* By AlzRiss - Usanagi Umi AI */


const inFlight = new Set()

export function enqueue(taskId, taskFn) {
  if (inFlight.has(taskId)) return

  inFlight.add(taskId)

  Promise.resolve()
    .then(taskFn)
    .catch((err) => {
      console.log(`  \x1b[31m✗\x1b[0m  Error pada task ${taskId}: ${err.message}`)
    })
    .finally(() => {
      inFlight.delete(taskId)
    })
}

export function isProcessing(taskId) {
  return inFlight.has(taskId)
}

export default { enqueue, isProcessing }
