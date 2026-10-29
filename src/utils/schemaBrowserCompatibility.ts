import { Buffer } from 'buffer'

// The schema parser uses Buffer for both object checks and external references.
// Supply the browser implementation only when the host has not provided one.
export const ensureSchemaBrowserCompatibility = () => {
  const runtime = globalThis as typeof globalThis & { Buffer?: typeof Buffer }
  runtime.Buffer ??= Buffer
}
