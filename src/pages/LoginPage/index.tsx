import { ControlOutlined } from '@ant-design/icons'
import { Alert, Button, Divider, Layout } from 'antd'
import { AxiosError } from 'axios'
import { FormInput, FormInputPassword, useAuth } from 'isp-ui-kit'
import { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { apiPaths } from '@constants/api/apiPaths'
import { ValidationRules } from '@constants/form/validationRules'
import {
  localStorageKeys,
  sessionStorageKeys
} from '@constants/localStorageKeys'
import { messages } from '@constants/messages'

import ClearStateOnLogin from '@pages/LoginPage/ClearStateOnLogin'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { getConfigProperty } from '@utils/configUtils'
import { LocalStorage } from '@utils/localStorageUtils'

import { routePaths } from '@routes/routePaths'

import { MSPError } from '@type/index'
import { LoginRequest } from '@type/login.type'

import './login-page.scss'

const passwordLoginEnabled = getConfigProperty('ENABLE_PASSWORD_LOGIN', true)
const LoginPage = () => {
  const oAuthLoginEnabled = getConfigProperty(
    'ENABLE_OAUTH_LOGIN',
    import.meta.env.VITE_ENABLE_OAUTH_LOGIN
  )
  const oAuthLoginButtonText = getConfigProperty(
    'OAUTH_LOGIN_BUTTON_TEXT',
    import.meta.env.VITE_OAUTH_LOGIN_BUTTON_TEXT
  )
  const { login, isLoading, oAuthLogin } = useAuth()
  const { handleSubmit, control, setError } = useForm<LoginRequest>({
    mode: 'onChange'
  })
  const navigate = useNavigate()

  const setFormError = (statusText: string, message: string): void => {
    setError('email', {})
    setError('password', {
      message,
      type: statusText
    })
  }

  const handleError = (err: AxiosError<MSPError>): void => {
    const { response, status } = err
    if (response && status === 401) {
      setFormError(response.statusText, messages.loginError)
    } else {
      setFormError('serverError', messages.serverError)
    }
  }

  const handleSubmitForm = (data: LoginRequest): void => {
    login(apiPaths.login, data, {
      'X-APPLICATION-TOKEN': getConfigProperty(
        'APP_TOKEN',
        import.meta.env.VITE_APP_TOKEN
      )
    })
      .then((response) => {
        LocalStorage.set(localStorageKeys.HEADER_NAME, response.headerName)
        LocalStorage.set(localStorageKeys.USER_TOKEN, response.token)
        LocalStorage.remove(localStorageKeys.OAUTH_LOGIN)
        const prevRoute = sessionStorage.getItem(sessionStorageKeys.PREV_ROUTE)
        const redirectUrl =
          !prevRoute ||
          prevRoute === routePaths.login ||
          prevRoute === routePaths.error
            ? routePaths.home
            : prevRoute
        sessionStorage.removeItem(sessionStorageKeys.PREV_ROUTE)
        navigate(redirectUrl, { replace: true })
      })
      .catch((err: AxiosError<MSPError>) => handleError(err))
  }

  const handleSubmitOAuthForm = (): void => {
    oAuthLogin(
      apiPaths.loginOAuth,
      {
        clientName: getConfigProperty(
          'CLIENT_NAME',
          import.meta.env.VITE_CLIENT_NAME
        )
      },
      {
        'X-APPLICATION-TOKEN': getConfigProperty(
          'APP_TOKEN',
          import.meta.env.VITE_APP_TOKEN
        )
      }
    )
      .then((response) => {
        if (!response.loginUrl) throw new Error('Missing OAuth login URL')
        LocalStorage.set(localStorageKeys.OAUTH_LOGIN, true)
        window.location.href = response.loginUrl
      })
      .catch((error) => notifyApiError(error, messages.serverError))
  }

  const renderInternalAuthForm = () => {
    if (!passwordLoginEnabled) {
      return null
    }

    return (
      <div className="login-page__fields">
        <ClearStateOnLogin />
        <FormInput
          data-cy="email-input"
          control={control}
          name="email"
          id="login-email"
          label="Логин"
          size="large"
          disabled={isLoading}
          rules={{ required: ValidationRules.required }}
        />
        <FormInputPassword
          data-cy="password-input"
          control={control}
          name="password"
          id="login-password"
          label="Пароль"
          size="large"
          disabled={isLoading}
          trimOnBlur={false}
          rules={{ required: ValidationRules.required }}
        />
        <Button
          data-cy="submit-btn"
          disabled={isLoading}
          loading={isLoading}
          type="primary"
          className="login-page__content__submit-btn"
          size="large"
          block
          htmlType="submit"
        >
          Войти
        </Button>
      </div>
    )
  }

  const renderOAuthAuthBtn = (): ReactNode => {
    if (!oAuthLoginEnabled) {
      return null
    }

    return (
      <Button
        data-cy="submit-oAuth-btn"
        disabled={isLoading}
        loading={isLoading}
        type={passwordLoginEnabled ? 'default' : 'primary'}
        htmlType="button"
        size="large"
        block
        className="login-page__content__submit-oAuth-btn"
        onClick={handleSubmitOAuthForm}
      >
        {oAuthLoginButtonText || 'Корпоративный вход'}
      </Button>
    )
  }

  return (
    <Layout className="login-page-shell">
      <main className="login-page">
        <form
          className="login-page__panel"
          aria-labelledby="login-title"
          onSubmit={
            passwordLoginEnabled
              ? handleSubmit(handleSubmitForm)
              : (event) => event.preventDefault()
          }
        >
          <header className="login-page__heading">
            <span className="login-page__brand-mark" aria-hidden="true">
              <ControlOutlined />
            </span>
            <div>
              <div className="login-page__brand">ISP</div>
              <h1
                id="login-title"
                data-cy="login-title"
                className="login-page__title"
              >
                Вход
              </h1>
            </div>
          </header>
          {renderInternalAuthForm()}
          {passwordLoginEnabled && oAuthLoginEnabled && (
            <Divider plain>или</Divider>
          )}
          {renderOAuthAuthBtn()}
          {!passwordLoginEnabled && !oAuthLoginEnabled && (
            <Alert
              type="info"
              showIcon
              title="Вход пока недоступен"
              description="Обратитесь к администратору для настройки способа входа."
            />
          )}
        </form>
      </main>
    </Layout>
  )
}

export default LoginPage
