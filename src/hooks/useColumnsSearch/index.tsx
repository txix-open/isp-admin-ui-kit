import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, InputRef, Space, TableColumnType } from 'antd'
import { useRef } from 'react'

import { Filters } from '@components/VariablesComponents/VariablesTable/variables-table.type'

import './variable-column-search.scss'

export const useColumnSearch = <T,>() => {
  const searchInput = useRef<InputRef>(null)

  const getColumnSearchProps = (
    dataIndex: keyof T,
    filteredInfo: Filters
  ): TableColumnType<T> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close
    }) => (
      <div
        className="variable-column-search"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder="Введите значение"
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          className="variable-column-search__input"
        />
        <Space className="variable-column-search__buttons">
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            className="variable-column-search__buttons__find"
          >
            Найти
          </Button>
          <Button
            onClick={() => {
              clearFilters?.()
              confirm()
            }}
            size="small"
            className="variable-column-search__buttons__clear"
          >
            Сбросить
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Закрыть
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? 'variable-column-search__filtered-icon' : undefined
        }}
      />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex]
      return recordValue
        ? String(recordValue)
            .toLowerCase()
            .includes(String(value).toLowerCase())
        : false
    },
    filteredValue: filteredInfo[dataIndex] || null
  })

  return { getColumnSearchProps }
}
