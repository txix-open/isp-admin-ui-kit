import { Divider, message, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FormComponents } from 'isp-ui-kit'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { ValidationRules } from '@constants/form/validationRules.ts'

import SaveButton from '@ui/SaveButton'

import AgreementModal from '@widgets/AgreementModal'

import { RolesContentPropsType } from '@components/RolesContent/roles-content.type.ts'

import useRole from '@hooks/useRole.tsx'

import { PermissionKeysType, RoleType } from '@type/roles.type.ts'

import './roles-content.scss'

const newRole: Partial<RoleType> = {
  externalGroup: '',
  name: '',
  permissions: []
}

const columns: ColumnsType = [
  {
    title: 'Действие',
    dataIndex: 'name'
  },
  {
    title: 'Ключ в системе',
    dataIndex: 'key'
  }
]
const { FormInput } = FormComponents
const RolesContent = ({
  role,
  permissions,
  saveRole,
  title = 'Редактировать',
  immutable = false
}: RolesContentPropsType) => {
  const {
    control,
    formState: { isDirty },
    setError,
    getValues,
    reset
  } = useForm<RoleType>({
    defaultValues: role,
    mode: 'onChange'
  })
  const { hasPermission } = useRole()
  const { id: selectedItemId } = useParams()

  const [openModal, setOpenModal] = useState<boolean>(false)
  const isUpdateRole = hasPermission(PermissionKeysType.role_update)
  const isCreateRole = hasPermission(PermissionKeysType.role_add)

  const isSaveBtnAvailable =
    selectedItemId === 'new' ? isCreateRole : isUpdateRole

  useEffect(() => {
    if (!role) {
      reset(newRole)
    } else {
      reset(role)
    }
  }, [role])

  const handleSubmitForm = (changeMessage: string) => {
    if (!changeMessage) {
      message.error('Поле не может быть пустым')
      return
    }
    const formValue = getValues()
    formValue.changeMessage = changeMessage
    saveRole(formValue, setError)
    setOpenModal(false)
  }

  const renderFormTable = () => (
    <Controller
      control={control}
      name="permissions"
      render={({ field: { value, onChange } }) => (
        <Table
          columns={columns}
          dataSource={permissions}
          pagination={{ pageSize: 10 }}
          scroll={{
            y: 'calc(100vh - 270px)'
          }}
          rowSelection={{
            selectedRowKeys: value,
            type: 'checkbox',
            onChange: (selectedRowKeys) => {
              onChange(selectedRowKeys)
            },
            getCheckboxProps: () => ({
              disabled: immutable
            })
          }}
        />
      )}
    />
  )

  return (
    <>
      {openModal && (
        <AgreementModal
          open
          destroyOnClose
          onCancel={() => setOpenModal(false)}
          okText="Сохранить"
          title="Для подтверждения изменений укажите причину"
          description="Основание для измений"
          onConfirm={handleSubmitForm}
        />
      )}
      <form className="roles-content">
        <div className="roles-content__header">
          <h2
            data-cy="roles-content__header__title"
            className="roles-content__header__title"
          >
            {title}
          </h2>
          <SaveButton
            disabled={!isDirty || !isSaveBtnAvailable}
            type="primary"
            data-cy="roles-content__header__save-button"
            onClick={() => setOpenModal(true)}
            className="roles-content__header__save-button"
          />
        </div>
        <Divider />
        <div className="roles-content__wrap-input">
          <FormInput
            data-cy="roles-content__input__name"
            rules={{ required: ValidationRules.required }}
            label="Наименование&nbsp;роли"
            name="name"
            control={control}
          />
          <FormInput
            data-cy="roles-content__input__external-group"
            label="Группы ЕСК"
            name="externalGroup"
            control={control}
          />
        </div>
        {renderFormTable()}
      </form>
    </>
  )
}

export default RolesContent
