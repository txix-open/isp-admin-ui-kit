import { DownloadOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import { useState } from 'react'

import { downloadCsv, type RoleDownloadParams } from '@services/downloadService'

import type { TableSearchParams } from '@type/table-search.type'

type DownloadCsvButtonProps = {
  disabled?: boolean
  iconOnly?: boolean
} & (
  | { type: 'user'; params?: TableSearchParams }
  | { type: 'role'; params?: RoleDownloadParams }
  | { type: 'session'; params?: TableSearchParams }
  | { type: 'log'; params?: TableSearchParams }
)

const DownloadCsvButton = ({
  type,
  params,
  disabled,
  iconOnly = false
}: DownloadCsvButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadCsv(type, params)
      message.success('Файл успешно сохранен')
    } catch {
      message.error('Не удалось выгрузить CSV')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      type={iconOnly ? 'default' : 'primary'}
      icon={<DownloadOutlined />}
      aria-label="Выгрузить CSV"
      title="Выгрузить CSV"
      data-cy={`${type}-download-csv`}
      disabled={disabled}
      loading={isDownloading}
      onClick={handleDownload}
    >
      {iconOnly ? null : 'Выгрузить CSV'}
    </Button>
  )
}

export default DownloadCsvButton
