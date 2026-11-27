import type { TableSearchValue } from '@type/table-search.type'

export const highlightSearchMatch = (
  value: string | number | null | undefined,
  search: TableSearchValue | undefined
) => {
  const text = String(value ?? '')
  if (
    (typeof search !== 'string' && typeof search !== 'number') ||
    search === ''
  ) {
    return text
  }

  const pattern = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.split(new RegExp(`(${pattern})`, 'giu')).map((part, index) =>
    index % 2 === 0 ? (
      part
    ) : (
      <mark key={index} className="admin-column-search-match">
        {part}
      </mark>
    )
  )
}
