import { Button, Empty, Table } from 'antd'
import { useSearchParams } from 'react-router-dom'

import { useVariableColumns } from './variable-table-columns'
import {
  matchesVariableFilters,
  readVariableTableState
} from './variableTableState'
import './variables-table.scss'
import type { OnChange, VariablesTablePropsType } from './variables-table.type'

const pageSize = 50

const VariablesTable = ({
  dataTable,
  onRemoveVariable,
  loading,
  unavailable,
  removingName
}: VariablesTablePropsType) => {
  const [params, setParams] = useSearchParams()
  const state = readVariableTableState(params)
  const hasFilters = Boolean(state.name || state.value)
  const filteredCount = dataTable.filter((variable) =>
    matchesVariableFilters(variable, state)
  ).length
  const page = Math.min(
    state.page,
    Math.max(1, Math.ceil(filteredCount / pageSize))
  )
  const columns = useVariableColumns(
    { columnKey: state.sort, order: state.order },
    {
      name: state.name ? [state.name] : null,
      value: state.value ? [state.value] : null
    },
    onRemoveVariable,
    removingName
  )

  const clearAll = () => {
    const next = new URLSearchParams(params)
    for (const key of ['name', 'value', 'sort', 'order', 'page'])
      next.delete(key)
    setParams(next, { replace: true })
  }

  const handleChange: OnChange = (pagination, filters, sorter, extra) => {
    const next = new URLSearchParams(params)
    const sort = Array.isArray(sorter) ? sorter[0] : sorter
    const values = {
      name: String(filters.name?.[0] ?? ''),
      value: String(filters.value?.[0] ?? ''),
      sort: sort.order ? String(sort.columnKey) : '',
      order: sort.order ?? '',
      page:
        extra.action === 'paginate' && pagination.current !== 1
          ? String(pagination.current)
          : ''
    }
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: extra.action !== 'paginate' })
  }

  return (
    <section className="variables-table" aria-label="Список переменных">
      <div className="variables-table__toolbar">
        <p className="page-layout__summary" role="status">
          {loading
            ? 'Загрузка переменных…'
            : unavailable
              ? 'Список переменных недоступен'
              : `Найдено ${filteredCount} из ${dataTable.length} переменных`}
        </p>
        <Button
          data-testid="variables-table__clear-all-btn"
          disabled={!hasFilters && !state.sort}
          onClick={clearAll}
        >
          Сбросить фильтры и сортировку
        </Button>
      </div>
      <Table<VariableType>
        className="page-layout__table"
        rowKey="name"
        loading={loading}
        dataSource={dataTable}
        columns={columns}
        tableLayout="fixed"
        scroll={{ x: 1450 }}
        onChange={handleChange}
        pagination={{
          current: page,
          pageSize,
          showSizeChanger: false,
          hideOnSinglePage: true
        }}
        locale={{
          emptyText: unavailable ? (
            'Список недоступен. Повторите загрузку.'
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                hasFilters
                  ? 'По заданным условиям переменные не найдены'
                  : 'Переменных пока нет'
              }
            >
              {hasFilters && (
                <Button onClick={clearAll}>Сбросить фильтры</Button>
              )}
            </Empty>
          )
        }}
      />
    </section>
  )
}

export default VariablesTable
