import { Button } from 'antd'
import { NotFoundPage } from 'isp-ui-kit'
import { useNavigate } from 'react-router-dom'

import { routePaths } from '@routes/routePaths'

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
