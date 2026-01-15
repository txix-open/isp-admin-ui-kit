export const getCleanPath = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || '/'

  if (baseUrl === '/') {
    return path
  }

  if (path.startsWith(baseUrl)) {
    const cleanPath = path.replace(baseUrl, '')
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  }

  return path
}
