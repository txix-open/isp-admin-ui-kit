import { Button } from 'antd'
import { ErrorPage } from 'isp-ui-kit'
import { useNavigate } from 'react-router-dom'

import { routePaths } from '@routes/routePaths.ts'

const ErrorWrapperPage = () => {
  const navigate = useNavigate()

  return (
    <ErrorPage>
      <Button type="primary" onClick={() => navigate(routePaths.modules)}>
        На главную
      </Button>
    </ErrorPage>
  )
}

export default ErrorWrapperPage
