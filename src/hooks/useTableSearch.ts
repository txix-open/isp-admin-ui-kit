import type { TableProps, TableColumnsType } from 'antd'
import { useSearchParams } from 'react-router-dom'

import { buildTableSearchQuery } from '@utils/tableSearch'

import type {
  TableSearchOrder,
  TableSearchParams,
  TableSearchQuery,
  TableSearchValue
} from '@type/table-search.type'

const filterKey = 'tableFilters'
const sortKey = 'tableSort'

const readJson = (value: string | null): unknown => {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const isScalar = (value: unknown): value is string | number =>
  (typeof value === 'string' && value.length > 0) ||
  (typeof value === 'number' && Number.isFinite(value))

const readQuery = (
  value: unknown,
  fields: readonly string[],
  dateFields: readonly string[],
  multiSelectFields: readonly string[]
): TableSearchQuery | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return

  const filters = Object.fromEntries(
    Object.entries(value).flatMap(
      ([field, filter]): [string, TableSearchValue][] => {
        if (!fields.includes(field)) return []
        if (dateFields.includes(field)) {
          const from = filter?.from
          const to = filter?.to
          return typeof from === 'string' &&
            typeof to === 'string' &&
            Date.parse(from) <= Date.parse(to)
            ? [[field, { from, to }]]
            : []
        }
        if (multiSelectFields.includes(field)) {
          return Array.isArray(filter) &&
            filter.length > 0 &&
            filter.every(isScalar)
            ? [[field, filter]]
            : []
        }
        return isScalar(filter) ? [[field, filter]] : []
      }
    )
  )
  return Object.keys(filters).length ? filters : undefined
}

export const useTableSearch = <T>(
  fields: readonly string[],
  dateFields: readonly string[],
  multiSelectFields: readonly string[]
) => {
  const [url, setUrl] = useSearchParams()
  const query = readQuery(
    readJson(url.get(filterKey)),
    fields,
    dateFields,
    multiSelectFields
  )
  const rawOrder = readJson(url.get(sortKey)) as
    Partial<TableSearchOrder> | undefined
  const order: TableSearchOrder | undefined =
    rawOrder?.field &&
    fields.includes(rawOrder.field) &&
    (rawOrder.type === 'asc' || rawOrder.type === 'desc')
      ? { field: rawOrder.field, type: rawOrder.type }
      : undefined

  const update = (
    nextQuery?: TableSearchQuery,
    nextOrder?: TableSearchOrder,
    clearKeys: readonly string[] = []
  ) => {
    const params = new URLSearchParams(url)
    for (const key of [filterKey, sortKey, 'page', ...clearKeys])
      params.delete(key)
    if (nextQuery && Object.keys(nextQuery).length) {
      params.set(filterKey, JSON.stringify(nextQuery))
    }
    if (nextOrder) params.set(sortKey, JSON.stringify(nextOrder))
    setUrl(params, { replace: true })
  }

  const handleTableChange: NonNullable<TableProps<T>['onChange']> = (
    _pagination,
    filters,
    sorter,
    { action }
  ) => {
    if (action === 'filter') {
      update(
        buildTableSearchQuery(filters, dateFields, multiSelectFields),
        order
      )
    }
    if (action === 'sort' && !Array.isArray(sorter)) {
      const { field, order: direction } = sorter
      update(
        query,
        typeof field === 'string' && direction
          ? { field, type: direction === 'ascend' ? 'asc' : 'desc' }
          : undefined
      )
    }
  }

  const searchParams: TableSearchParams | undefined =
    query || order ? { query, order } : undefined

  const removeFilter = (field: string) => {
    const next = { ...query }
    delete next[field]
    update(next, order)
  }
  const clearSort = () => update(query)
  const reset = (clearKeys?: readonly string[]) =>
    update(undefined, undefined, clearKeys)
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
    handleTableChange,
    removeFilter,
    clearSort,
    reset,
    applyToColumns
  }
}
