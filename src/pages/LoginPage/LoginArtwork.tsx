import { AppstoreOutlined } from '@ant-design/icons'

const LoginArtwork = () => (
  <aside className="login-page__welcome">
    <div className="login-page__brand">
      <AppstoreOutlined aria-hidden="true" />
      <span>ISP</span>
    </div>
    <div className="login-page__artwork" aria-hidden="true">
      <span className="login-page__block login-page__block--one" />
      <span className="login-page__block login-page__block--two" />
      <span className="login-page__block login-page__block--three" />
      <span className="login-page__block login-page__block--four" />
    </div>
    <h2>
      Панель
      <br />
      управления
    </h2>
  </aside>
)

export default LoginArtwork
