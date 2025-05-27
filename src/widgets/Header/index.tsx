import { theme } from 'antd'
import { useMemo } from 'react'

import { HeaderPropsType } from '@widgets/Header/header.type.ts'

import { getContrastTextColor } from '@utils/styleUtils.ts'

import { useAppSelector } from '@hooks/redux.ts'

import './header.scss'

const Header = ({ collapsed }: HeaderPropsType) => {
  const {
    ui: { name, primaryColor }
  } = useAppSelector((state) => state.UIReducer)
  const { useToken } = theme
  const { token } = useToken()

  const safePrimaryColor = primaryColor || token.colorBgLayout

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
