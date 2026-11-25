import { DownloadOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import { useState } from 'react'

import { notifyApiError } from '@utils/apiErrorNotifications'

import {
  downloadCsv,
  type CsvDownloadParams,
  type CsvDownloadType
} from '@services/downloadService'

const labels: Record<CsvDownloadType, { text: string; scope: string }> = {
  user: {
    text: 'CSV до 1000',
    scope: 'Скачать CSV: до 1000 пользователей с учётом серверных фильтров'
  },
  role: { text: 'CSV всех ролей', scope: 'Скачать CSV всех ролей' },
  session: {
    text: 'CSV страницы',
    scope: 'Скачать CSV текущей страницы сессий'
  },
  log: { text: 'CSV страницы', scope: 'Скачать CSV текущей страницы журнала' }
}

interface DownloadCsvButtonProps {
  type: CsvDownloadType
  params?: CsvDownloadParams
  disabled?: boolean
}

const DownloadCsvButton = ({
  type,
  params,
  disabled
}: DownloadCsvButtonProps) => {
  const { text, scope } = labels[type]
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadCsv(type, params)
      message.success('CSV скачан')
    } catch (error) {
      notifyApiError(error, 'Не удалось скачать CSV')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      icon={<DownloadOutlined aria-hidden />}
      aria-label={scope}
      title={scope}
      data-cy={`${type}-download-csv`}
      disabled={disabled}
      loading={isDownloading}
      onClick={handleDownload}
    >
      {text}
    </Button>
  )
}

export default DownloadCsvButton
