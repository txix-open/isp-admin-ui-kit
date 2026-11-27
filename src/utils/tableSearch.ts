import type { FilterValue } from 'antd/es/table/interface'

import type { TableSearchQuery } from '@type/table-search.type'

export const buildTableSearchQuery = (
  filters: Record<string, FilterValue | null>,
  dateFields: readonly string[],
  multiSelectFields: readonly string[]
): TableSearchQuery | undefined => {
  const query: TableSearchQuery = {}

  for (const [field, keys] of Object.entries(filters)) {
    const values = keys?.filter(
      (value): value is string | number =>
        typeof value === 'number' || (typeof value === 'string' && value !== '')
    )
    if (!values?.length) continue

    if (dateFields.includes(field)) {
      const [from, to] = values
      if (typeof from === 'string' && typeof to === 'string') {
        query[field] = { from, to }
      }
    } else {
      query[field] = multiSelectFields.includes(field) ? values : values[0]
    }
  }

  return Object.keys(query).length ? query : undefined
}
