export const getHttpMethodLabel = (method?: string) =>
  method?.trim() || 'Неизвестный'

export const matchesAccessRoute = (
  endpoint: { path: string; httpMethod?: string },
  search: string,
  httpMethods: string[]
) => {
  const query = search.trim().toLowerCase()
  const method = endpoint.httpMethod?.trim() ?? ''
  const text = `${getHttpMethodLabel(method)} ${endpoint.path}`.toLowerCase()
  return (
    (!query || text.includes(query)) &&
    (!httpMethods.length || httpMethods.includes(method))
  )
}
