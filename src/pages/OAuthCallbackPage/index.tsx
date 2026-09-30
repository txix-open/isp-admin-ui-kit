import { Button, Layout, Result, Spin } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getLoginRedirectUrl } from '@utils/loginRedirectUtils'

import useSudirLogin from '@hooks/useSudirLogin'

import { routePaths } from '@routes/routePaths'

const OAuthCallbackPage = () => {
  const navigate = useNavigate()
  const { loginSudir } = useSudirLogin()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const providerError = searchParams.has('error')
  const [failed, setFailed] = useState(false)
  const request = useRef<{
    code: string
    promise: Promise<void>
  } | null>(null)

  useEffect(() => {
    if (!code || providerError) return

    let active = true
    setFailed(false)

    if (request.current?.code !== code) {
      request.current = {
        code,
        promise: loginSudir({ authCode: code })
      }
    }

    request.current.promise
      .then(() => {
        if (active) navigate(getLoginRedirectUrl(), { replace: true })
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
    }
  }, [code, providerError, navigate, loginSudir])

  if (!code || providerError || failed) {
    return (
      <Layout style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <Result
          status="error"
          title="Не удалось войти в аккаунт"
          subTitle="Вернитесь на страницу входа и попробуйте ещё раз."
          extra={
            <Button
              onClick={() => navigate(routePaths.login, { replace: true })}
            >
              На страницу входа
            </Button>
          }
        />
      </Layout>
    )
  }

  return <Spin fullscreen />
}

export default OAuthCallbackPage
