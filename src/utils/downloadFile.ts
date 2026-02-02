interface DownloadFileOptions {
  fileName: string
  content: string | Blob
  mimeType?: string
}

export const downloadFile = ({
  fileName,
  content,
  mimeType = 'application/octet-stream'
}: DownloadFileOptions) => {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}
