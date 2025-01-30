type MessagesKey = 'serverError' | 'loginError'

export const messages: Record<MessagesKey, string> = {
  serverError: 'Внутренняя ошибка сервиса',
  loginError: 'Неверный логин или пароль'
}
