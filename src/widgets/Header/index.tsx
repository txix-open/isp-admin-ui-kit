import { HeaderPropsType } from '@widgets/Header/header.type.ts'

import { useAppSelector } from '@hooks/redux.ts'

import './header.scss'

const Header = ({ collapsed }: HeaderPropsType) => {
  const {
    ui: { name, primaryColor }
  } = useAppSelector((state) => state.UIReducer)

  return (
    <section
      className="header"
      style={{
        backgroundColor: primaryColor
      }}
    >
      <span className={collapsed ? 'header__text-closed' : 'header__text'}>
        {name}
      </span>
    </section>
  )
}

export default Header
