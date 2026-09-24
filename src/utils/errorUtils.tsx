import { message } from 'antd'
import { AxiosError } from 'axios'
import { ReactNode } from 'react'

import { MSPError } from '@type/index'

type ApiErrorMessage = ReactNode | ((data: MSPError) => ReactNode)

const stringifyValue = (value: unknown): string =>
  value != null && typeof value === 'object'
    ? JSON.stringify(value)
    : String(value)

const getDetailsLines = (details: unknown): string[] => {
  if (details == null) {
    return []
  }

  if (typeof details === 'string') {
    return [details]
  }

  if (Array.isArray(details)) {
    return details.map(stringifyValue)
  }

  if (typeof details === 'object') {
    return Object.entries(details as Record<string, unknown>).map(
      ([key, value]) => `${key}: ${stringifyValue(value)}`
    )
  }

  return [String(details)]
}

const API_ERROR_MESSAGES: Record<number, ApiErrorMessage> = {
  610: 'Модуль не существует',
  620: (data) => {
    const lines = getDetailsLines(data.details)
    return (
      <div>
        <div style={{ textAlign: 'center' }}>Неверная схема конфига</div>
        {lines.length > 0 && (
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            {lines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    )
  },
  700: (data) => {
    const name = (data.details as { name?: string })?.name
    return name ? `GIT с именем ${name} не существует` : 'GIT не существует'
  },
  701: 'Невозможно расшифровать токен',
  710: (data) => {
    const name = (data.details as { name?: string })?.name
    return name ? `GIT с именем ${name} уже существует` : 'GIT уже существует'
  },
  810: 'Невалидный токен',
  821: 'Файл не найден',
  822: 'Репозитория не существует',
  823: 'Директории не существует',
  824: 'Репозиторий пуст',
  825: 'Такого коммита не существует',
  826: 'Такого тега не существует',
  830: 'Путь до файла выходит за пределы разрешённой директории',
  831: 'Неверный формат файла'
}

export const handleApiError = (
  error: unknown,
  fallbackMessage?: string
): void => {
  const data = (error as AxiosError<MSPError>)?.response?.data

  let messageContent: ReactNode
  if (data) {
    const errorCode = parseInt(data.errorCode ?? '', 10)
    const template = Number.isNaN(errorCode)
      ? undefined
      : API_ERROR_MESSAGES[errorCode]
    if (template) {
      messageContent =
        typeof template === 'function' ? template(data) : template
    }
  }

  if (messageContent) {
    message.error(messageContent)
    return
  }

  if (fallbackMessage) {
    message.error(fallbackMessage)
  }
}
