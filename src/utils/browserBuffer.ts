import { Buffer } from 'buffer'

// RefParser's browser build still calls Buffer.isBuffer().
if (typeof globalThis.Buffer === 'undefined') {
  Object.assign(globalThis, { Buffer })
}
