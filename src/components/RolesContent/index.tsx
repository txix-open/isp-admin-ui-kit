import { Divider, message, Table, TableColumnType, TableProps } from 'antd'
import { FormInput } from 'isp-ui-kit'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { ValidationRules } from '@constants/form/validationRules'

import SaveButton from '@ui/SaveButton'

import AgreementModal from '@widgets/AgreementModal'

import { RolesContentPropsType } from '@components/RolesContent/roles-content.type'

import { useColumnSearch } from '@hooks/useColumnsSearch'
import useRole from '@hooks/useRole'

import { PermissionKeysType, PermissionType, RoleType } from '@type/roles.type'

import './roles-content.scss'

const newRole: Partial<RoleType> = {
  externalGroup: '',
  name: '',
  permissions: []
}

type PermissionTableOnChange = NonNullable<TableProps<PermissionType>['onChange']>
type PermissionTableFilters = Parameters<PermissionTableOnChange>[1]

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
  const { getColumnSearchProps } = useColumnSearch<PermissionType>()
  const { id: selectedItemId } = useParams()

  const [openModal, setOpenModal] = useState<boolean>(false)
  const [filteredInfo, setFilteredInfo] = useState<PermissionTableFilters>({})
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

  const columns: TableColumnType<PermissionType>[] = [
    {
      title: 'Действие',
      dataIndex: 'name',
      ...getColumnSearchProps('name', filteredInfo)
    },
    {
      title: 'Ключ в системе',
      dataIndex: 'key',
      ...getColumnSearchProps('key', filteredInfo)
    }
  ]

  const handleTableChange: PermissionTableOnChange = (_, filters) => {
    setFilteredInfo(filters)
  }

  const renderFormTable = () => (
    <Controller
      control={control}
      name="permissions"
      render={({ field: { value, onChange } }) => (
        <Table
          columns={columns}
          dataSource={permissions}
          onChange={handleTableChange}
          pagination={false}
          rowKey="key"
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
