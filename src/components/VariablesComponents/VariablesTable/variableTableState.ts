const sortFields = ['name', 'type', 'createdAt', 'updatedAt'] as const
type SortField = (typeof sortFields)[number]

interface VariableTableState {
  page: number
  name: string
  value: string
  sort?: SortField
  order: 'ascend' | 'descend' | null
}

export const readVariableTableState = (
  params: URLSearchParams
): VariableTableState => {
  const page = Number(params.get('page'))
  const sort = params.get('sort')
  const order = params.get('order')
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    name: params.get('name') ?? '',
    value: params.get('value') ?? '',
    sort: sortFields.includes(sort as SortField)
      ? (sort as SortField)
      : undefined,
    order: order === 'ascend' || order === 'descend' ? order : null
  }
}

export const matchesVariableSearch = (value: unknown, search: string) =>
  String(value ?? '')
    .toLowerCase()
    .includes(search.toLowerCase())

export const matchesVariableFilters = (
  variable: VariableType,
  filters: { name: string; value: string }
) =>
  matchesVariableSearch(variable.name, filters.name) &&
  (!filters.value ||
    (variable.type === 'TEXT' &&
      matchesVariableSearch(variable.value, filters.value)))
