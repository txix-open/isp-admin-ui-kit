import { ControlOutlined } from '@ant-design/icons'
import { theme } from 'antd'

import { HeaderPropsType } from '@widgets/Header/header.type'

import { getContrastTextColor } from '@utils/styleUtils'

import { useAppSelector } from '@hooks/redux'

import './header.scss'

const Header = ({ collapsed }: HeaderPropsType) => {
  const {
    ui: { name, primaryColor }
  } = useAppSelector((state) => state.UIReducer)
  const { useToken } = theme
  const { token } = useToken()

  // По умолчанию без собственного цвета потребителя: тон primary темы
  // (светлая #e6f4ff / тёмная #20375b), контраст текста считается утилитой
  const safePrimaryColor = primaryColor || token.colorPrimaryBg

  const textColor = primaryColor
    ? getContrastTextColor(safePrimaryColor)
    : token.colorText
  const projectName = name?.trim() || 'Панель управления'
  const version = window.AppVersion?.trim()
  const versionLabel =
    version && (version.startsWith('v') ? version : `v${version}`)

  return (
    <section
      className="admin-brand"
      data-collapsed={collapsed}
      style={{ backgroundColor: safePrimaryColor, color: textColor }}
      title={versionLabel ? `${projectName} · ${versionLabel}` : projectName}
    >
      <span className="admin-brand__mark" aria-hidden>
        <ControlOutlined />
      </span>
      <div className="admin-brand__details">
        <span className="admin-brand__name">{projectName}</span>
        {versionLabel && (
          <span className="admin-brand__version">{versionLabel}</span>
        )}
      </div>
    </section>
  )
}

export default Header
