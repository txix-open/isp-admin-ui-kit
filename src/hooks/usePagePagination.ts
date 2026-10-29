import { useSearchParams } from 'react-router-dom'

const usePagePagination = (pageSize: number) => {
  const [params, setParams] = useSearchParams()
  const value = Number(params.get('page'))
  const page = Number.isSafeInteger(value) && value > 0 ? value : 1
  return {
    page,
    offset: (page - 1) * pageSize,
    changePage: (nextPage: number) => {
      const next = new URLSearchParams(params)
      if (nextPage === 1) next.delete('page')
      else next.set('page', String(nextPage))
      setParams(next)
    }
  }
}

export default usePagePagination
