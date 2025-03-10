import { Button, Table } from 'antd'
import { useState } from 'react'

import { getColumns } from '@components/VariablesComponents/VariablesTable/variable-table-columns.tsx'

import {
  Sorts,
  VariablesTablePropsType,
  OnChange,
  Filters
} from './variables-table.type.ts'

import './variables-table.scss'

const VariablesTable = ({
  dataTable,
  onRemoveVariable
}: VariablesTablePropsType) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const [sortedInfo, setSortedInfo] = useState<Sorts>({})

  const hasActiveFilters = Object.values(filteredInfo).some((value) => value)
  const hasActiveSorting = sortedInfo.order

  const isClearDisabled = !hasActiveFilters && !hasActiveSorting

  const clearAll = () => {
    setFilteredInfo({})
    setSortedInfo({})
  }

  const handleChange: OnChange = (_, filters, sorter) => {
    setFilteredInfo(filters)
    setSortedInfo(sorter as Sorts)
  }

  return (
    <section className="variables-table">
      <Button
        className="variables-table__clear-all-btn"
        disabled={isClearDisabled}
        onClick={clearAll}
      >
        Очистить все фильтры и сортировки
      </Button>
      <Table
        size="small"
        rowKey={(record) => record.name}
        dataSource={dataTable}
        columns={getColumns(sortedInfo, filteredInfo, onRemoveVariable)}
        scroll={{ y: 'calc(100vh - 270px)', x: 1500 }}
        onChange={handleChange}
        pagination={{
          current: currentPage,
          onChange: setCurrentPage,
          pageSize: 50,
          showSizeChanger: false
        }}
      />
    </section>
  )
}

export default VariablesTable
