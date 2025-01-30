import { NavigateFunction, SetURLSearchParams } from 'react-router-dom'

export const setSelectedItemId = (
  path: string,
  id: string,
  searchParams: string,
  navigate: NavigateFunction
): void => {
  navigate(
    {
      pathname: `${path}/${id}`,
      search: searchParams
    },
    { replace: true }
  )
}

export const setSearchValue = (
  value: string,
  setSearchParams: SetURLSearchParams,
  prefix: string = 'search'
) => {
  setSearchParams((prev) => {
    if (!value) {
      prev.delete(prefix)
    } else {
      prev.set(prefix, value)
    }
    return prev
  })
}
