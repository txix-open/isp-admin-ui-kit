import { Button } from 'antd'
import { useState } from 'react'

import { useMobileWorkspace } from '@hooks/useMobileWorkspace'

export const useCompactTable = () => {
  const isMobile = useMobileWorkspace()
  const [fullView, setFullView] = useState(false)
  const compact = isMobile && !fullView
  const toggle = isMobile ? (
    <Button onClick={() => setFullView(!fullView)}>
      {compact ? 'Полная таблица' : 'Компактный вид'}
    </Button>
  ) : null
  return { compact, toggle }
}
