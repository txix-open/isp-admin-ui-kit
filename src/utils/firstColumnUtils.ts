import { ColumnItem } from 'isp-ui-kit/dist/Layout/Column/column.type'

export const filterFirstColumnItems = <T extends NonNullable<unknown>>(
  listItems: ColumnItem<T>[],
  searchValue: string
): ColumnItem<T>[] => {
  const normalizedSearchValue = searchValue.toLowerCase().trim()
  return listItems
    ? listItems.filter((el) => {
        const normalizedName = el.name.toLowerCase().trim()
        const normalizedId = el.id.toString().toLowerCase().trim()
        return (
          normalizedName.includes(normalizedSearchValue) ||
          normalizedId.includes(normalizedSearchValue)
        )
      })
    : []
}
