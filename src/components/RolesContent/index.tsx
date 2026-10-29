import { Button, message, Table, TableColumnType, TableProps } from 'antd'
import { FormInput } from 'isp-ui-kit'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import AgreementModal from '@widgets/AgreementModal'

import { PageHeader } from '@components/PageLayout'
import { RolesContentPropsType } from '@components/RolesContent/roles-content.type'

import { hasRoleChanges } from '@utils/formChanges'

import { useColumnSearch } from '@hooks/useColumnsSearch'
import useRole from '@hooks/useRole'

import { PermissionKeysType, PermissionType, RoleType } from '@type/roles.type'

import './roles-content.scss'

const newRole: Partial<RoleType> = {
  externalGroup: '',
  name: '',
  permissions: []
}

type PermissionTableOnChange = NonNullable<
  TableProps<PermissionType>['onChange']
>
type PermissionTableFilters = Parameters<PermissionTableOnChange>[1]

const RolesContent = ({
  role,
  permissions,
  saveRole,
  title = 'Роль пользователя',
  immutable = false,
  onCancel
}: RolesContentPropsType) => {
  const {
    control,
    formState: { defaultValues, isSubmitting },
    setError,
    handleSubmit,
    reset
  } = useForm<RoleType>({
    defaultValues: role ?? newRole,
    mode: 'onChange'
  })
  const values = useWatch({ control })
  const hasChanges = hasRoleChanges(values, defaultValues ?? {})
  const { hasPermission } = useRole()
  const { getColumnSearchProps } = useColumnSearch<PermissionType>()

  const [openModal, setOpenModal] = useState<boolean>(false)
  const [filteredInfo, setFilteredInfo] = useState<PermissionTableFilters>({})
  const isUpdateRole = hasPermission(PermissionKeysType.role_update)
  const isCreateRole = hasPermission(PermissionKeysType.role_add)

  const isSaveBtnAvailable = role ? isUpdateRole : isCreateRole

  const requestSave = handleSubmit(() => {
    if (!hasChanges || !isSaveBtnAvailable || isSubmitting) return
    setOpenModal(true)
  })

  const confirmSave = (changeMessage: string) => {
    if (!hasChanges || !isSaveBtnAvailable || isSubmitting) return

    const reason = changeMessage.trim()
    if (!reason) {
      message.error('Укажите причину изменений')
      return
    }

    return handleSubmit((values) => {
      return saveRole({ ...values, changeMessage: reason }, setError).then(
        (saved) => {
          if (saved) {
            reset(values)
            setOpenModal(false)
          }
        }
      )
    })()
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
          sticky
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys: value,
            type: 'checkbox',
            onChange: (selectedRowKeys) => {
              onChange(selectedRowKeys)
            },
            getCheckboxProps: () => ({
              disabled: immutable || !isSaveBtnAvailable || isSubmitting
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
          destroyOnHidden
          onCancel={() => {
            if (!isSubmitting) setOpenModal(false)
          }}
          confirmLoading={isSubmitting}
          cancelButtonProps={{ disabled: isSubmitting }}
          closable={!isSubmitting}
          mask={{ closable: !isSubmitting }}
          keyboard={!isSubmitting}
          okText={role ? 'Сохранить изменения' : 'Создать роль'}
          cancelText="Отмена"
          title={
            role ? 'Подтвердите изменение роли' : 'Подтвердите создание роли'
          }
          description={role ? 'Причина изменений' : 'Причина создания роли'}
          onConfirm={confirmSave}
        />
      )}
      <form className="roles-content" onSubmit={requestSave}>
        <PageHeader
          className="roles-content__header"
          level={2}
          focusOnMount
          title={role?.name || title}
          context={
            role
              ? isSaveBtnAvailable
                ? 'Редактирование роли'
                : 'Просмотр роли'
              : 'Создание роли'
          }
          description={
            !role
              ? 'Роль ещё не создана. Заполните название и выберите права. Она появится в списке после подтверждения создания.'
              : undefined
          }
          actions={
            <>
              {!role && onCancel && (
                <Button
                  data-cy="roles-content__cancel-create"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Отменить создание
                </Button>
              )}
              {isSaveBtnAvailable && (
                <Button
                  disabled={!hasChanges || !isSaveBtnAvailable || isSubmitting}
                  loading={isSubmitting}
                  type="primary"
                  data-cy="roles-content__header__save-button"
                  htmlType="submit"
                  className="roles-content__header__save-button"
                >
                  {role ? 'Сохранить изменения' : 'Создать роль'}
                </Button>
              )}
            </>
          }
        />
        <div className="roles-content__wrap-input">
          <FormInput
            data-cy="roles-content__input__name"
            rules={{ required: ValidationRules.required }}
            label="Наименование&nbsp;роли"
            name="name"
            control={control}
            disabled={!isSaveBtnAvailable || isSubmitting}
          />
          <FormInput
            data-cy="roles-content__input__external-group"
            label="Группы ФРИИПа"
            name="externalGroup"
            control={control}
            disabled={!isSaveBtnAvailable || isSubmitting}
          />
        </div>
        <div className="roles-content__permissions">
          <div className="roles-content__permissions__header">
            <h3>Права доступа</h3>
            <span role="status">
              Выбрано: {values.permissions?.length ?? 0}
            </span>
          </div>
          {renderFormTable()}
        </div>
      </form>
    </>
  )
}

export default RolesContent
