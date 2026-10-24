/* By AlzRiss - Usanagi Umi AI */

/**
 * Membuat lapisan mutable di atas message Baileys tanpa memodifikasi
 * WebMessageInfo asli. Properti protobuf seperti mentionedJid/quoted dapat
 * berupa getter read-only, sehingga assignment langsung akan melempar
 * TypeError pada versi Baileys terbaru.
 */
export function createMutableMessageView(message) {
  const source = message && typeof message === 'object' ? message : {}
  const shadow = Object.create(null)

  return new Proxy(shadow, {
    get(target, property) {
      if (Reflect.has(target, property)) return Reflect.get(target, property)
      const value = Reflect.get(source, property, source)
      return typeof value === 'function' ? value.bind(source) : value
    },
    set(target, property, value) {
      Reflect.set(target, property, value)
      return true
    },
    has(target, property) {
      return Reflect.has(target, property) || Reflect.has(source, property)
    },
    ownKeys(target) {
      return [...new Set([...Reflect.ownKeys(source), ...Reflect.ownKeys(target)])]
    },
    getOwnPropertyDescriptor(target, property) {
      const own = Reflect.getOwnPropertyDescriptor(target, property)
      if (own) return own
      if (!Reflect.has(source, property)) return undefined
      return {
        configurable: true,
        enumerable: Reflect.getOwnPropertyDescriptor(source, property)?.enumerable !== false,
        writable: true,
        value: Reflect.get(source, property, source),
      }
    },
  })
}

export default createMutableMessageView
