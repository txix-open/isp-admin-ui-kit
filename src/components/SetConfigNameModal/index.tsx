import { FormInput } from 'isp-ui-kit'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { ValidationRules } from '@constants/form/validationRules.ts'

import Modal from '@widgets/Modal'

import { SetConfigNameModalProps } from '@components/SetConfigNameModal/set-config-name-modal.type.ts'

import { routePaths } from '@routes/routePaths.ts'

const SetConfigNameModal: FC<SetConfigNameModalProps> = ({
  open,
  onClose,
  currentModule = {}
}) => {
  const { control, handleSubmit, reset } = useForm({
    mode: 'onChange'
  })
  const navigate = useNavigate()
  const { id: moduleId } = useParams()
  const onSubmit = ({ name }: { name: string }) => {
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
