import { SearchOutlined } from '@ant-design/icons'
import { Button, DatePicker, Input, InputNumber, Select, Space } from 'antd'
import type { TableColumnType } from 'antd'
import dayjs from 'dayjs'

import './column-search.scss'

// Select defaults its internal input to autocomplete="new-password".
const selectComponents = {
  input: <input type="search" autoComplete="off" />
}

type SearchOptions =
  | { type: 'date'; title: string; showTime?: boolean }
  | {
      type: 'select'
      title: string
      options: { value: string | number; label: string }[]
    }
  | { type?: 'text' | 'number'; title: string }

export const getColumnSearchProps = <T,>(
  config: SearchOptions
): TableColumnType<T> => ({
  filterDropdown: ({
    selectedKeys,
    setSelectedKeys,
    confirm,
    clearFilters,
    close
  }) => {
    const placeholder = `Поиск: ${config.title}`
    const value = selectedKeys[0]

    const renderInput = () => {
      switch (config.type) {
        case 'date':
          return (
            <DatePicker.RangePicker
              format={config.showTime ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY'}
              showTime={config.showTime}
              value={
                selectedKeys.length === 2
                  ? [dayjs(String(value)), dayjs(String(selectedKeys[1]))]
                  : null
              }
              onChange={(dates) => {
                const [from, to] = dates ?? []
                setSelectedKeys(
                  from && to
                    ? [
                        (config.showTime
                          ? from
                          : from.startOf('day')
                        ).toISOString(),
                        (config.showTime ? to : to.endOf('day')).toISOString()
                      ]
                    : []
                )
              }}
            />
          )
        case 'select':
          return (
            <Select
              components={selectComponents}
              mode="multiple"
              placeholder={placeholder}
              showSearch={{ optionFilterProp: 'label' }}
              value={selectedKeys}
              options={config.options}
              onChange={setSelectedKeys}
              allowClear
            />
          )
        case 'number':
          return (
            <InputNumber
              aria-label={config.title}
              autoComplete="off"
              controls={false}
              placeholder={placeholder}
              value={typeof value === 'number' ? value : null}
              onChange={(next) => setSelectedKeys(next === null ? [] : [next])}
              onPressEnter={() => confirm()}
            />
          )
        default:
          return (
            <Input
              aria-label={config.title}
              type="search"
              autoComplete="off"
              placeholder={placeholder}
              value={String(value ?? '')}
              onChange={({ target }) =>
                setSelectedKeys(target.value ? [target.value] : [])
              }
              onPressEnter={() => confirm()}
              allowClear
            />
          )
      }
    }

    return (
      <div
        className="admin-column-search"
        onKeyDown={(event) => event.stopPropagation()}
      >
        {renderInput()}
        <Space>
          <Button type="primary" size="small" onClick={() => confirm()}>
            Поиск
          </Button>
          <Button
            size="small"
            onClick={() =>
              clearFilters?.({ confirm: true, closeDropdown: true })
            }
          >
            Сбросить
          </Button>
          <Button type="link" size="small" onClick={close}>
            Закрыть
          </Button>
        </Space>
      </div>
    )
  },
  filterIcon: (filtered) => (
    <SearchOutlined
      style={{
        color: filtered ? 'var(--ant-color-primary, #1677ff)' : undefined
      }}
    />
  )
})
