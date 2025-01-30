import { Button, ButtonProps } from 'antd'

import './save-button.scss'

const SaveButton = ({ className, icon, ...rest }: ButtonProps) => {
  return (
    <Button {...rest} className={`save-button ${className}`}>
      Сохранить
    </Button>
  )
}

export default SaveButton
