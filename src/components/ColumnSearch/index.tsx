import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Select,
  TimePicker
} from 'antd'
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
  filterDropdownProps: {
    classNames: { root: 'admin-table-filter-popup' },
    getPopupContainer: () => document.body
  },
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
            <div className="admin-column-search__dates">
              {(['С', 'По'] as const).map((label, index) => (
                <label key={label}>
                  <span>{label}</span>
                  <div className="admin-column-search__date-boundary">
                    <DatePicker
                      classNames={{
                        popup: { root: 'admin-column-search-calendar' }
                      }}
                      aria-label={`${config.title}: ${label.toLowerCase()}`}
                      placeholder={
                        index === 0 ? 'Начало периода' : 'Конец периода'
                      }
                      format="DD.MM.YYYY"
                      value={
                        selectedKeys[index]
                          ? dayjs(String(selectedKeys[index]))
                          : null
                      }
                      onChange={(date) => {
                        const next = [
                          selectedKeys[0] ?? '',
                          selectedKeys[1] ?? ''
                        ]
                        const previous = selectedKeys[index]
                          ? dayjs(String(selectedKeys[index]))
                          : undefined
                        next[index] = date
                          ? (config.showTime && previous
                              ? date
                                  .hour(previous.hour())
                                  .minute(previous.minute())
                                  .second(previous.second())
                                  .millisecond(0)
                              : index === 0
                                ? date.startOf('day')
                                : date.endOf('day')
                            ).toISOString()
                          : ''
                        setSelectedKeys(next.some(Boolean) ? next : [])
                      }}
                    />
                    {config.showTime && (
                      <TimePicker
                        className="admin-column-search__time"
                        format="HH:mm:ss"
                        placeholder="Время"
                        needConfirm={false}
                        allowClear={false}
                        aria-label={`${config.title}: время ${label.toLowerCase()}`}
                        disabled={!selectedKeys[index]}
                        value={
                          selectedKeys[index]
                            ? dayjs(String(selectedKeys[index]))
                            : null
                        }
                        onChange={(time) => {
                          if (!time || !selectedKeys[index]) return
                          const next = [...selectedKeys]
                          next[index] = dayjs(String(selectedKeys[index]))
                            .hour(time.hour())
                            .minute(time.minute())
                            .second(time.second())
                            .millisecond(0)
                            .toISOString()
                          setSelectedKeys(next)
                        }}
                      />
                    )}
                  </div>
                </label>
              ))}
            </div>
          )
        case 'select':
          return (
            <Select
              aria-label={config.title}
              components={selectComponents}
              mode="multiple"
              placeholder={placeholder}
              showSearch={{ optionFilterProp: 'label' }}
              value={selectedKeys}
              options={config.options}
              onChange={setSelectedKeys}
              allowClear
              maxTagCount="responsive"
            />
          )
        case 'number':
          return (
            <InputNumber
              autoFocus
              aria-label={config.title}
              autoComplete="off"
              controls={false}
              placeholder={placeholder}
              value={typeof value === 'number' ? value : null}
              onChange={(next) => setSelectedKeys(next === null ? [] : [next])}
            />
          )
        default:
          return (
            <Input
              autoFocus
              aria-label={config.title}
              type="search"
              autoComplete="off"
              placeholder={placeholder}
              value={String(value ?? '')}
              onChange={({ target }) =>
                setSelectedKeys(target.value ? [target.value] : [])
              }
              allowClear
            />
          )
      }
    }

    return (
      <form
        className="admin-column-search"
        aria-label={`Фильтр: ${config.title}`}
        onKeyDown={(event) => {
          event.stopPropagation()
          if (event.key === 'Escape') close()
          if (
            event.key === 'Enter' &&
            (event.target as HTMLElement).closest('.ant-picker')
          )
            event.preventDefault()
        }}
        onSubmit={(event) => {
          event.preventDefault()
          confirm()
        }}
      >
        <div className="admin-column-search__heading">
          <span>{config.title}</span>
          <Button
            type="text"
            size="small"
            aria-label="Закрыть фильтр"
            icon={<CloseOutlined />}
            onClick={close}
          />
        </div>
        {renderInput()}
        <div className="admin-column-search__actions">
          <Button
            type="text"
            onClick={() =>
              clearFilters?.({ confirm: true, closeDropdown: true })
            }
          >
            Сбросить
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={
              config.type === 'date' &&
              selectedKeys.length > 0 &&
              (!selectedKeys[0] ||
                !selectedKeys[1] ||
                dayjs(String(selectedKeys[0])).isAfter(
                  dayjs(String(selectedKeys[1]))
                ))
            }
          >
            Применить
          </Button>
        </div>
      </form>
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
