import { Button } from 'antd'
import { Layout } from 'isp-ui-kit'
import { useNavigate } from 'react-router-dom'

import { routePaths } from '@routes/routePaths.ts'

const { NotFoundPage } = Layout

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <NotFoundPage>
      <Button type="primary" onClick={() => navigate(routePaths.home)}>
        На главную
      </Button>
    </NotFoundPage>
  )
}

export default NotFound
