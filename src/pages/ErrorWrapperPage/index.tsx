import { Button } from 'antd'
import { ErrorPage } from 'isp-ui-kit'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@hooks/redux'

import { fetchProfile, fetchUI } from '@stores/redusers/ActionCreators'
import { StateProfileStatus } from '@stores/redusers/ProfileSlice'

import { routePaths } from '@routes/routePaths'

const ErrorWrapperPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.profileReducer.status)

  const handleGoHome = () => {
    if (status === StateProfileStatus.rejected) {
      dispatch(fetchProfile())
      dispatch(fetchUI())
    }
    navigate(routePaths.home, { replace: true })
  }

  return (
    <ErrorPage>
      <Button type="primary" onClick={handleGoHome}>
        На главную
      </Button>
    </ErrorPage>
  )
}

export default ErrorWrapperPage
