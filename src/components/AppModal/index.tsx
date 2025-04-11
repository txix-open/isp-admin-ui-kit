import { SyncOutlined } from '@ant-design/icons'
import { Button, message, Tooltip } from 'antd'
import { FormComponents } from 'isp-ui-kit'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ValidationRules } from '@constants/form/validationRules.ts'
import Modal from '@widgets/Modal'
import { AppModalType } from '@components/AppModal/app-group-modal.type.ts'
import { ApplicationAppType } from '@pages/ApplicationsPage/applications.type.ts'
import applicationsApi from '@services/applicationsService.ts'
import './app-modal.scss'

const { FormInput, FormTextArea, FormInputNumber } = FormComponents

const AppModal: FC<AppModalType> = ({ title, onOk, onClose, open, app, isNew = false, isExistsId }) => {
  const [getNextAppId] = applicationsApi.useGetNextAppIdMutation()

  const { handleSubmit, control, reset, setValue, setError, clearErrors } =
    useForm<ApplicationAppType>({
      mode: 'onChange',
      defaultValues: app
    })
  
    useEffect(() => {
      if (open) {
        reset(app)
      }
    }, [open])

  useEffect(() => {
    if (isExistsId?.field && isExistsId?.message) {
      setError(isExistsId.field as keyof ApplicationAppType, {
        type: 'manual',
        message: isExistsId.message
      })
    }
  }, [isExistsId])


  const handleGetNextAppId = () => {
    getNextAppId()
      .then((res) => {
        setValue('id', Number(res.data) as number)
        message.success('Идентификатор сгеренирован')
        clearErrors()
      })
      .catch(() => {
        message.error('Ошибка генерации идентификатора')
        clearErrors()
      })
  }

  return (
    <Modal
      onOk={handleSubmit(onOk)}
      title={title}
      open={open}
      footer={{ onCanselText: 'Отмена', onOkText: 'Сохранить' }}
      onClose={() => {
        if (onClose) {
          onClose()
        }
        reset()
      }}
    >
      <form>
        <FormInput
          control={control}
          name="name"
          label="Наименование"
          rules={{ required: ValidationRules.required }}
        />
        <FormTextArea
          autoSize={{ minRows: 2, maxRows: 6 }}
          control={control}
          label="Описание"
          name="description"
        />

        <div className="generate_id">
          <FormInputNumber
            control={control}
            name="id"
            label="Идентификатор"
            rules={{ required: ValidationRules.required }}
            addonAfter={isNew && (
              <Tooltip title="Генерация ключа">
                <Button icon={<SyncOutlined />} onClick={handleGetNextAppId} />
              </Tooltip>
            )}
          />
        </div>
      </form>
    </Modal>
  )
}

export default AppModal
