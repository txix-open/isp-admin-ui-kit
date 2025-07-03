import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { resetApiCaches, resetRootState } from '@stores/index.tsx'

import { routePaths } from '@routes/routePaths.ts'

const ClearStateOnLogin = () => {
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    if (location.pathname === routePaths.login) {
      dispatch(resetApiCaches() as any)
      dispatch(resetRootState())
    }
  }, [location.pathname, dispatch])

  return null
}

export default ClearStateOnLogin
