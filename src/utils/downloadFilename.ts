export const getDownloadFilename = (
  contentDisposition: string | undefined,
  fallback: string
): string => {
  if (!contentDisposition) return fallback

  const encoded = /filename\*\s*=\s*UTF-8'[^']*'([^;]+)/i.exec(
    contentDisposition
  )
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim()) || fallback
    } catch {
      // Fall back to the plain filename when the encoded value is invalid.
    }
  }

  const plain = /filename\s*=\s*(?:"([^"]*)"|'([^']*)'|([^;]*))/i.exec(
    contentDisposition
  )
  return (plain?.[1] ?? plain?.[2] ?? plain?.[3])?.trim() || fallback
}
