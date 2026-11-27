export type TableSearchValue =
  string | number | (string | number)[] | { from: string; to: string }

export type TableSearchQuery = Record<string, TableSearchValue>

export interface TableSearchOrder {
  field: string
  type: 'asc' | 'desc'
}

export interface TableSearchParams {
  query?: TableSearchQuery
  order?: TableSearchOrder
}
