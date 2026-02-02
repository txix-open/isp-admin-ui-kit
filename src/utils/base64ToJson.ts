export function base64ToUtf8(base64: string): string {
  try {
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(bytes)
  } catch (err) {
    console.error('Ошибка декодирования Base64:', err)
    return ''
  }
}
