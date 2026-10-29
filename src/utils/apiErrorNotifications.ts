import { message } from 'antd'
import type { ReactNode } from 'react'

interface ErrorNotification {
  handled: boolean
  timer?: ReturnType<typeof setTimeout>
}

const notifications = new WeakMap<object, ErrorNotification>()

const getNotification = (error: unknown) => {
  if (!error || typeof error !== 'object') return undefined
  let notification = notifications.get(error)
  if (!notification) {
    notification = { handled: false }
    notifications.set(error, notification)
  }
  return notification
}

export const ignoreApiError = (error: unknown) => {
  const notification = getNotification(error)
  if (notification) {
    clearTimeout(notification.timer)
    notification.handled = true
  }
}

export const notifyApiError = (error: unknown, content: ReactNode) => {
  const notification = getNotification(error)
  if (notification?.handled) return
  ignoreApiError(error)
  if ((error as { code?: string })?.code === 'ERR_CANCELED') return
  message.error(content)
}

// Give the method's catch handler the first opportunity to explain the failure.
// Requests without a local handler still receive one fallback notification.
export const scheduleApiError = (error: unknown, content: ReactNode) => {
  const notification = getNotification(error)
  if (!notification || notification.handled || notification.timer) return
  notification.timer = setTimeout(() => notifyApiError(error, content), 0)
}
