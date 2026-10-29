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
  const hasFilters = Boolean(
    filters.search || filters.roleId !== undefined || filters.status !== 'all'
  )
  return (
    <div
      className="users-page__filters"
      role="search"
      aria-label="Поиск и фильтры пользователей"
    >
      <label className="users-page__filters__search">
        <span>Поиск по загруженному списку</span>
        <Input
          allowClear
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
      <Button disabled={!hasFilters} onClick={onReset}>
        Сбросить фильтры
      </Button>
    </div>
  )
}

export default UsersFilters
