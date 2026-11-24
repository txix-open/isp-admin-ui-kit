import { CloseOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'

import { dateFormats } from '@constants/date'

import type {
  TableSearchOrder,
  TableSearchQuery,
  TableSearchValue
} from '@type/table-search.type'

import './column-search.scss'

interface FilterOption {
  value: string | number
  label: string
}

interface TableSearchControlsProps<T> {
  query?: TableSearchQuery
  order?: TableSearchOrder
  columns: TableColumnsType<T>
  options: Record<string, FilterOption[]>
  onRemove: (field: string) => void
  onClearSort: () => void
  onReset: () => void
}

const formatFilter = (
  value: TableSearchValue,
  options: FilterOption[] = []
) => {
  if (typeof value === 'object' && !Array.isArray(value)) {
    return [value.from, value.to]
      .map((date) => dayjs(date).format(dateFormats.fullFormat))
      .join(' — ')
  }

  const values = Array.isArray(value) ? value : [value]
  return values
    .map(
      (item) => options.find((option) => option.value === item)?.label ?? item
    )
    .join(', ')
}

const TableSearchControls = <T,>({
  query,
  order,
  columns,
  options,
  onRemove,
  onClearSort,
  onReset
}: TableSearchControlsProps<T>) => {
  if (!query && !order) return null

  const getColumnName = (field: string) => {
    const { title } =
      columns.find(
        (column) => 'dataIndex' in column && column.dataIndex === field
      ) ?? {}
    return typeof title === 'string' ? title : field
  }

  return (
    <div className="admin-table-filters">
      <ul
        className="admin-table-filters__list"
        aria-label="Активные фильтры и сортировка"
      >
        {Object.entries(query ?? {}).map(([field, value]) => {
          const name = getColumnName(field)
          const label = `${name}: ${formatFilter(value, options[field])}`

          return (
            <li key={field}>
              <Button
                size="small"
                icon={<CloseOutlined />}
                aria-label={`Удалить фильтр «${name}»`}
                title={label}
                onClick={() => onRemove(field)}
              >
                <span className="admin-table-filters__label">{label}</span>
              </Button>
            </li>
          )
        })}
        {order && (
          <li>
            <Button
              size="small"
              icon={<CloseOutlined />}
              aria-label="Сбросить сортировку"
              onClick={onClearSort}
            >
              <span className="admin-table-filters__label">
                {getColumnName(order.field)}
                {order.type === 'asc' ? ' ↑' : ' ↓'}
              </span>
            </Button>
          </li>
        )}
      </ul>
      <Button size="small" type="link" onClick={onReset}>
        Сбросить всё
      </Button>
    </div>
  )
}

export default TableSearchControls
