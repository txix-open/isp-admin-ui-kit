import { theme } from 'antd'
import { useMemo } from 'react'

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

  const textColor = useMemo(
    () => getContrastTextColor(safePrimaryColor),
    [safePrimaryColor]
  )

  const collapsedClassName = collapsed ? 'header__text-closed' : 'header__text'

  return (
    <section
      className="header"
      style={{
        backgroundColor: safePrimaryColor,
        color: textColor
      }}
    >
      <div className={`header__container ${collapsedClassName}`}>
        <span className="header__container__project-name">{name}</span>
        <span className="header__container__project-version">
          v{window.AppVersion}
        </span>
      </div>
    </section>
  )
}

export default Header
