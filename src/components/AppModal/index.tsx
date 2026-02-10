import { SyncOutlined } from '@ant-design/icons'
import { Button, message, Tooltip } from 'antd'
import { FormInput, FormTextArea, FormInputNumber } from 'isp-ui-kit'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import Modal from '@widgets/Modal'

import { AppModalType } from '@components/AppModal/app-group-modal.type'

import { ApplicationAppType } from '@pages/ApplicationsPage/applications.type'

import applicationsApi from '@services/applicationsService'

import './app-modal.scss'

const AppModal: FC<AppModalType> = ({
  title,
  onOk,
  onClose,
  open,
  app,
  isNew = false,
  isExistsId
}) => {
  const [getNextAppId, { isLoading }] =
    applicationsApi.useGetNextAppIdMutation()
  const { handleSubmit, control, reset, setValue, setError, clearErrors } =
    useForm<ApplicationAppType>({
      mode: 'onChange',
      defaultValues: app
    })

  useEffect(() => {
    if (open) {
      reset(app)
    }

    if (isNew) {
      reset()
    }
  }, [open, isNew])

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
      loading={isLoading}
      footer={{ onCanselText: 'Отмена', onOkText: 'Сохранить' }}
      onClose={() => {
        if (onClose) {
          onClose()
        }
        reset()
      }}
    >
      <form>
        <div className="generate_id">
          <FormInputNumber
            control={control}
            name="id"
            label="Идентификатор"
            rules={{ required: ValidationRules.required }}
            addonAfter={
              isNew && (
                <Tooltip title="Сгенерировать">
                  <Button
                    icon={<SyncOutlined />}
                    onClick={handleGetNextAppId}
                    loading={isLoading}
                  />
                </Tooltip>
              )
            }
          />
        </div>
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
      </form>
    </Modal>
  )
}

export default AppModal
