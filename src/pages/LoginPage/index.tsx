import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Divider, Layout } from 'antd'
import { AxiosError } from 'axios'
import { FormComponents, useAuth } from 'isp-ui-kit'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { apiPaths } from '@constants/api/apiPaths.ts'
import { ValidationRules } from '@constants/form/validationRules.ts'
import { localStorageKeys } from '@constants/localStorageKeys.ts'
import { messages } from '@constants/messages.ts'

import { getConfigProperty } from '@utils/configUtils.ts'
import { LocalStorage } from '@utils/localStorageUtils.ts'

import { routePaths } from '@routes/routePaths.ts'

import { MSPError } from '@type/index.ts'
import { LoginRequest } from '@type/login.type.ts'

import './login-page.scss'

const passwordLoginEnabled = getConfigProperty('ENABLE_PASSWORD_LOGIN', true)

const LoginPage = () => {
  const { login, isLoading } = useAuth()
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
        const redirectUrl =
          sessionStorage.getItem('prevRoute') || routePaths.home
        navigate(redirectUrl, { replace: true })
      })
      .catch((err: AxiosError<MSPError>) => handleError(err))
  }

  const renderInternalAuthForm = () => {
    if (!passwordLoginEnabled) {
      return null
    }

    return (
      <>
        <FormComponents.FormInput
          data-cy="email-input"
          control={control}
          name="email"
          className="login-page__content__email-field"
          prefix={<UserOutlined className="color" />}
          placeholder="Логин"
          rules={{ required: ValidationRules.required }}
        />
        <FormComponents.FormInput
          data-cy="password-input"
          control={control}
          name="password"
          className="login-page__content__password-field"
          prefix={<LockOutlined className="color" />}
          type="password"
          placeholder="Пароль"
          rules={{ required: ValidationRules.required }}
        />
        <Button
          data-cy="submit-btn"
          disabled={isLoading}
          loading={isLoading}
          type="primary"
          className="login-page__content__submit-btn"
          onClick={handleSubmit(handleSubmitForm)}
          htmlType="submit"
        >
          Войти
        </Button>
      </>
    )
  }

  return (
    <Layout>
      <section className="login-page">
        <form className="login-page__content">
          <h1 data-cy="login-title" className="login-page__content__title">
            Вход в систему
          </h1>
          <Divider />
          {renderInternalAuthForm()}
        </form>
      </section>
    </Layout>
  )
}

export default LoginPage
