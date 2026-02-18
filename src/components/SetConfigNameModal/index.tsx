import { FormInput } from 'isp-ui-kit'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { ValidationRules } from '@constants/form/validationRules'

import Modal from '@widgets/Modal'

import {
  ConfigNameFormType,
  SetConfigNameModalProps
} from '@components/SetConfigNameModal/set-config-name-modal.type'

import { routePaths } from '@routes/routePaths'

const SetConfigNameModal: FC<SetConfigNameModalProps> = ({
  open,
  onClose,
  currentModule = {}
}) => {
  const { control, handleSubmit, reset } = useForm<ConfigNameFormType>({
    mode: 'onChange'
  })
  const navigate = useNavigate()
  const { id: moduleId } = useParams()
  const onSubmit = ({ name }: ConfigNameFormType) => {
    navigate(`/${moduleId}/${routePaths.configEditor}/new`, {
      state: { currentModule, name: name }
    })
  }

  const handleCloseModal = () => {
    onClose()
    reset()
  }

  return (
    <Modal
      title="Создать конфигурацию"
      open={open}
      onClose={handleCloseModal}
      onOk={handleSubmit(onSubmit)}
      footer={{ onOkText: 'Сохранить', onCanselText: 'Отмена' }}
    >
      <form key="set-name-config-modal">
        <FormInput
          control={control}
          name="name"
          label="Наименование"
          rules={{ required: ValidationRules.required }}
        />
      </form>
    </Modal>
  )
}
export default SetConfigNameModal
