import { Button } from 'antd'
import { Layout } from 'isp-ui-kit'
import { useNavigate } from 'react-router-dom'

import { routePaths } from '@routes/routePaths.ts'

const { ErrorPage } = Layout

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
