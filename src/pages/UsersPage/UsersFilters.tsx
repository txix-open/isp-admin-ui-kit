import { ClearOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Select } from 'antd'

import type { UserFilters } from './userFilters'

type UsersFiltersProps = {
  filters: UserFilters
  roleOptions: { value: number; label: string }[]
  onChange: (name: 'search' | 'role' | 'status', value: string) => void
  onReset: () => void
}

const UsersFilters = ({
  filters,
  roleOptions,
  onChange,
  onReset
}: UsersFiltersProps) => {
  const activeFilters: { name: 'search' | 'role' | 'status'; label: string }[] =
    []
  if (filters.search.trim()) {
    activeFilters.push({
      name: 'search',
      label: `Поиск: ${filters.search.trim()}`
    })
  }
  if (filters.roleId !== undefined) {
    const role = roleOptions.find(({ value }) => value === filters.roleId)
    activeFilters.push({
      name: 'role',
      label: `Роль: ${role?.label ?? filters.roleId}`
    })
  }
  if (filters.status !== 'all') {
    const status =
      filters.status === 'blocked' ? 'Заблокированы' : 'Не заблокированы'
    activeFilters.push({ name: 'status', label: `Статус: ${status}` })
  }

  return (
    <div
      className="users-page__filters"
      role="search"
      aria-label="Поиск и фильтры пользователей"
    >
      <label className="users-page__filters__search">
        <span>Поиск по загруженному списку</span>
        <Input
          id="users-search-filter"
          allowClear
          prefix={<SearchOutlined />}
          value={filters.search}
          placeholder="Имя, фамилия, email или ID"
          onChange={(event) => onChange('search', event.target.value)}
        />
      </label>
      <div className="users-page__filters__select">
        <label htmlFor="users-role-filter">Роль</label>
        <Select
          id="users-role-filter"
          aria-label="Роль пользователя"
          allowClear
          showSearch={{ optionFilterProp: 'label' }}
          placeholder="Все роли"
          value={filters.roleId}
          options={roleOptions}
          onChange={(value) =>
            onChange('role', value === undefined ? '' : String(value))
          }
        />
      </div>
      <div className="users-page__filters__select">
        <label htmlFor="users-status-filter">Статус</label>
        <Select
          id="users-status-filter"
          aria-label="Статус пользователя"
          value={filters.status}
          options={[
            { value: 'all', label: 'Все пользователи' },
            { value: 'active', label: 'Не заблокированы' },
            { value: 'blocked', label: 'Заблокированы' }
          ]}
          onChange={(value) => onChange('status', value === 'all' ? '' : value)}
        />
      </div>
      <Button
        icon={<ClearOutlined />}
        disabled={!activeFilters.length && !filters.search}
        onClick={onReset}
      >
        Сбросить фильтры
      </Button>
      {activeFilters.length > 0 && (
        <ul
          className="users-page__filters__active"
          aria-label="Активные фильтры"
        >
          {activeFilters.map(({ name, label }) => (
            <li key={name}>
              <Button
                size="small"
                icon={<CloseOutlined />}
                iconPlacement="end"
                title={label}
                aria-label={`Снять фильтр «${label}»`}
                onClick={(event) => {
                  const control = event.currentTarget
                    .closest('[role="search"]')
                    ?.querySelector<HTMLElement>(`#users-${name}-filter`)
                  onChange(name, '')
                  control?.focus()
                }}
              >
                <span className="users-page__filters__active-label">
                  {label}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UsersFilters
