import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { Button, Empty } from 'antd'
import type { ButtonProps } from 'antd'
import dayjs from 'dayjs'
import { forwardRef } from 'react'
import type { ComponentRef, HTMLAttributes, ReactNode } from 'react'

import { dateFormats } from '@constants/date'

import './table-ui.scss'

/** Forward the native ref and trigger props so Tooltip, Dropdown and Popconfirm keep working. */
export const TableActionButton = forwardRef<
  ComponentRef<typeof Button>,
  ButtonProps
>(({ className = '', type = 'default', ...props }, ref) => (
  <Button
    {...props}
    ref={ref}
    type={type === 'primary' ? 'primary' : 'default'}
    size="middle"
    className={`admin-table-action ${className}`}
  />
))
TableActionButton.displayName = 'TableActionButton'

export const TableActions = ({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`admin-table-actions ${className}`} />
)

export const TableDate = ({
  value,
  empty = '—'
}: {
  value?: string | number | null
  empty?: ReactNode
}) => {
  if (value == null || value === '') return <>{empty}</>
  const date = dayjs(value)
  if (!date.isValid()) return <>{empty}</>
  return (
    <time
      className="admin-table-date"
      dateTime={date.toISOString()}
      aria-label={date.format(dateFormats.fullFormat)}
    >
      <span>{date.format('DD.MM.YYYY')}</span>
      <span>{date.format('HH:mm:ss')}</span>
    </time>
  )
}

const statusIcons = {
  success: CheckCircleOutlined,
  warning: ClockCircleOutlined,
  error: CloseCircleOutlined,
  info: InfoCircleOutlined,
  neutral: InfoCircleOutlined
}

export const TableStatus = ({
  tone = 'neutral',
  children
}: {
  tone?: keyof typeof statusIcons
  children: ReactNode
}) => {
  const Icon = statusIcons[tone]
  return (
    <span className="admin-table-status" data-tone={tone}>
      <Icon aria-hidden />
      <span>{children}</span>
    </span>
  )
}

export const TableEmpty = ({
  description,
  children
}: {
  description: string
  children?: ReactNode
}) => (
  <Empty
    className="admin-table-empty"
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description={description}
  >
    {children}
  </Empty>
)
