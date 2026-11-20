import type { TableProps, TableColumnsType } from 'antd'
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

  const removeFilter = (field: string) => {
    setQuery((previous) => {
      const next = { ...previous }
      delete next[field]
      return Object.keys(next).length ? next : undefined
    })
    setCurrentPage(1)
  }
  const clearSort = () => setOrder(undefined)
  const reset = () => {
    setQuery(undefined)
    setOrder(undefined)
    setCurrentPage(1)
  }
  const applyToColumns = (columns: TableColumnsType<T>): TableColumnsType<T> =>
    columns.map((column) => {
      if (!('dataIndex' in column) || typeof column.dataIndex !== 'string')
        return column
      const field = column.dataIndex
      const value = query?.[field]
      return {
        ...column,
        ...(column.filterDropdown
          ? {
              filteredValue:
                value === undefined
                  ? null
                  : Array.isArray(value)
                    ? value
                    : typeof value === 'object'
                      ? [value.from, value.to]
                      : [value]
            }
          : {}),
        ...(column.sorter
          ? {
              sortOrder:
                order?.field === field
                  ? order.type === 'asc'
                    ? 'ascend'
                    : 'descend'
                  : null
            }
          : {})
      }
    })

  return {
    query,
    order,
    searchParams,
    currentPage,
    setCurrentPage,
    handleTableChange,
    removeFilter,
    clearSort,
    reset,
    applyToColumns
  }
}
