import type { TableProps } from 'antd'
import { useState } from 'react'

import { buildTableSearchQuery } from '@utils/tableSearch'

import type {
  TableSearchOrder,
  TableSearchParams,
  TableSearchQuery
} from '@type/table-search.type'

export const useTableSearch = <T>(
  dateFields: readonly string[],
  multiSelectFields: readonly string[]
) => {
  const [query, setQuery] = useState<TableSearchQuery>()
  const [order, setOrder] = useState<TableSearchOrder>()
  const [currentPage, setCurrentPage] = useState(1)

  const handleTableChange: NonNullable<TableProps<T>['onChange']> = (
    _pagination,
    filters,
    sorter,
    { action }
  ) => {
    if (action === 'paginate') return

    if (action === 'filter') {
      setQuery(buildTableSearchQuery(filters, dateFields, multiSelectFields))
    }
    if (action === 'sort' && !Array.isArray(sorter)) {
      const { field, order: direction } = sorter
      setOrder(
        typeof field === 'string' && direction
          ? { field, type: direction === 'ascend' ? 'asc' : 'desc' }
          : undefined
      )
    }
    setCurrentPage(1)
  }

  const searchParams: TableSearchParams | undefined =
    query || order ? { query, order } : undefined

  return { query, searchParams, currentPage, setCurrentPage, handleTableChange }
}
