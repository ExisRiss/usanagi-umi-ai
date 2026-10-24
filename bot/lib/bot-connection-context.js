/* Legacy global.conn now resolves to the active message's bot, not another session. */
import { AsyncLocalStorage } from 'node:async_hooks'
const symbol = Symbol.for('usanagi.connection.context.v1')
if (!global[symbol]) {
  const state = { context: new AsyncLocalStorage(), main: global.conn }
  global[symbol] = state
  Object.defineProperty(global, 'conn', {
    configurable: true, enumerable: true,
    get() { return state.context.getStore() || state.main },
    set(value) { state.main = value },
  })
}
export function runWithBotConnection(conn, callback) { return global[symbol].context.run(conn, callback) }
export function getMainConnection() { return global[symbol].main }
