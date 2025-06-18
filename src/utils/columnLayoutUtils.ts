import { NavigateFunction, SetURLSearchParams } from 'react-router-dom'

export const setSelectedItemId = (
  path: string,
  id: string,
  searchParams: string,
  navigate: NavigateFunction
) => {
  const params = new URLSearchParams(searchParams)
  const pathname = `${path}/${id}`
  navigate(
    {
      pathname: pathname,
      search: params.toString()
    },
    { replace: true }
  )
}

export const setUrlValue = (
  value: string | undefined,
  setSearchParams: SetURLSearchParams,
  prefix: string
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
