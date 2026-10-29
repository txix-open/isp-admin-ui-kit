import {
  ArrowLeftOutlined,
  FileProtectOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  List,
  message,
  Popconfirm,
  Result,
  Spin,
  Tooltip
} from 'antd'
import { Column } from 'isp-ui-kit'
import { useEffect, useRef } from 'react'
import { UseFormSetError } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AppModal from '@components/AppModal'
import { PageHeader } from '@components/PageLayout'
import TokenContent from '@components/TokenContent'

import {
  ApplicationAppType,
  ApplicationsGroupType
} from '@pages/ApplicationsPage/applications.type'
import { useApplicationDialog } from '@pages/ApplicationsPage/useApplicationDialog'

import { ignoreApiError, notifyApiError } from '@utils/apiErrorNotifications'
import { setUrlValue } from '@utils/columnLayoutUtils'
import { filterFirstColumnItems } from '@utils/firstColumnUtils'

import useRole from '@hooks/useRole'

import applicationsApi from '@services/applicationsService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import ApplicationEmptyPanel from './ApplicationEmptyPanel'
import './applications-content.scss'

const ApplicationsContent = ({
  group,
  onBackToGroups
}: {
  group: ApplicationsGroupType
  onBackToGroups: () => void
}) => {
  const { appId = '' } = useParams()
  const columnHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (!appId) columnHeading.current?.focus({ preventScroll: true })
  }, [group.id, appId])
  const [params, setParams] = useSearchParams()
  const { dialog, openDialog, closeDialog } = useApplicationDialog()
  const { hasPermission } = useRole()
  const navigate = useNavigate()
  const query = applicationsApi.useGetApplicationsByAppGroupQuery({
    id: group.id
  })
  const applications = query.currentData ?? []
  const app = applications.find((item) => String(item.id) === appId)
  const [createApp, createState] =
    applicationsApi.useCreateApplicationServiceMutation()
  const [updateApp, updateState] =
    applicationsApi.useUpdateApplicationsServiceMutation()
  const [removeApp, removeState] =
    applicationsApi.useRemoveApplicationsServiceMutation()
  const busy =
    createState.isLoading || updateState.isLoading || removeState.isLoading
  const canAdd = hasPermission(PermissionKeysType.application_group_app_add)
  const canEdit = hasPermission(PermissionKeysType.application_group_app_edit)
  const canRemove = hasPermission(
    PermissionKeysType.application_group_app_delete
  )
  const canViewToken = hasPermission(
    PermissionKeysType.application_group_token_view
  )
  const canViewAccess = hasPermission(PermissionKeysType.app_access_view)
  const search = params.get('appSearchColumn') || params.get('appSearch') || ''

  const openApp = (id: string, replace = false) => {
    const next = new URLSearchParams(params)
    next.delete('dialog')
    navigate(
      {
        pathname: `${routePaths.applicationsGroup}/${group.id}${id ? `/application/${id}` : ''}`,
        search: next.toString()
      },
      { replace }
    )
  }
  const saveApp = (
    values: ApplicationAppType,
    setError: UseFormSetError<ApplicationAppType>
  ) => {
    const isNew = dialog === 'new-app'
    if (busy || (isNew ? !canAdd : !canEdit) || (!isNew && !app))
      return Promise.resolve()
    const request = isNew
      ? createApp({
          id: values.id,
          name: values.name,
          description: values.description,
          applicationGroupId: group.id,
          type: 'SYSTEM'
        }).unwrap()
      : updateApp({
          oldId: app!.id,
          newId: values.id,
          name: values.name,
          description: values.description
        }).unwrap()
    return request
      .then(() => {
        openApp(String(values.id), true)
        message.success(
          isNew ? 'Приложение создано' : 'Изменения приложения сохранены'
        )
      })
      .catch((error) => {
        if (Number(error.response?.data?.errorCode) === 604) {
          ignoreApiError(error)
          setError(
            'id',
            { type: 'server', message: 'Приложение с таким ID уже существует' },
            { shouldFocus: true }
          )
        } else notifyApiError(error, 'Не удалось сохранить приложение')
      })
  }
  const deleteApp = () => {
    if (!app || !canRemove || busy) return
    return removeApp([app.id])
      .unwrap()
      .then(() => {
        openApp('', true)
        message.success('Приложение удалено')
      })
      .catch((error) => notifyApiError(error, 'Не удалось удалить приложение'))
  }
  const renderDetails = () => {
    if (query.isLoading || (query.isFetching && !query.currentData))
      return (
        <Spin description="Загрузка приложений">
          <div style={{ minHeight: 160 }} />
        </Spin>
      )
    if (query.isError && !query.currentData)
      return <Empty description="Приложения недоступны. Повторите загрузку." />
    if (!appId)
      return (
        <ApplicationEmptyPanel
          searchToken={canViewToken}
          description="Выберите приложение, чтобы увидеть его данные и токены"
        />
      )
    if (!app)
      return (
        <Result
          status="404"
          title="Приложение не найдено в этой группе"
          extra={<Button onClick={() => openApp('')}>К приложениям</Button>}
        />
      )
    return (
      <>
        <PageHeader
          focusOnMount
          level={2}
          title={app.name}
          context={`Приложение · ID ${app.id} · Группа: ${group.name}`}
          description={app.description || 'Описание не задано'}
          back={
            <Button
              className="applications-content__back"
              onClick={() => openApp('')}
            >
              К приложениям
            </Button>
          }
          actions={
            <>
              {canViewAccess && (
                <Button
                  icon={<FileProtectOutlined />}
                  onClick={() => navigate(`${routePaths.appAccess}/${app.id}`)}
                >
                  Доступы
                </Button>
              )}
              {canEdit && (
                <Button disabled={busy} onClick={() => openDialog('edit-app')}>
                  Изменить приложение
                </Button>
              )}
              {canRemove && (
                <Popconfirm
                  title={`Удалить приложение «${app.name}»?`}
                  description="Это действие нельзя отменить."
                  okText="Удалить"
                  cancelText="Отмена"
                  onConfirm={deleteApp}
                >
                  <Button
                    danger
                    loading={removeState.isLoading}
                    disabled={busy}
                  >
                    Удалить
                  </Button>
                </Popconfirm>
              )}
            </>
          }
        />
        {canViewToken ? (
          <TokenContent id={app.id} />
        ) : (
          <Empty description="Нет права просматривать токены этого приложения" />
        )}
      </>
    )
  }

  return (
    <section
      className="applications-content"
      data-app-selected={Boolean(appId)}
    >
      {query.isError && (
        <Alert
          type="error"
          showIcon
          title={
            query.currentData
              ? 'Не удалось обновить приложения. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить приложения группы'
          }
          action={
            <Button onClick={() => query.refetch()} loading={query.isFetching}>
              Повторить
            </Button>
          }
        />
      )}
      <div className="applications-content__panels">
        <div className="applications-content__list">
          <Column<ApplicationAppType>
            columnKey="applications-content"
            title={
              <div className="applications-content__column-title">
                <Tooltip title="К группам">
                  <Button
                    className="applications-page__back"
                    type="text"
                    size="small"
                    aria-label="К группам"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBackToGroups}
                  />
                </Tooltip>
                <h3 ref={columnHeading} tabIndex={-1}>
                  Приложения
                </h3>
                <Tooltip title="Обновить приложения">
                  <Button
                    type="text"
                    size="small"
                    aria-label="Обновить приложения"
                    icon={<ReloadOutlined />}
                    onClick={() => query.refetch()}
                    loading={query.isFetching}
                  />
                </Tooltip>
                {canAdd && (
                  <Tooltip title="Новое приложение">
                    <Button
                      type="primary"
                      size="small"
                      aria-label="Новое приложение"
                      icon={<PlusOutlined />}
                      onClick={() => openDialog('new-app')}
                      disabled={busy}
                    />
                  </Tooltip>
                )}
              </div>
            }
            items={filterFirstColumnItems(applications, search)}
            isLoading={query.isLoading}
            sortableFields={[
              { value: 'name', label: 'Название' },
              { value: 'id', label: 'Идентификатор' },
              { value: 'createdAt', label: 'Дата создания' },
              { value: 'updatedAt', label: 'Дата обновления' }
            ]}
            sortValue={
              params.get(
                'applications-content-sort'
              ) as keyof ApplicationAppType
            }
            onChangeSortValue={(value) =>
              setUrlValue(value, setParams, 'applications-content-sort')
            }
            directionValue={params.get('applications-content-direction') ?? ''}
            onChangeDirectionValue={(value) =>
              setUrlValue(value, setParams, 'applications-content-direction')
            }
            searchValue={search}
            searchPlaceholder="Название или ID приложения"
            onChangeSearchValue={(value) => {
              const next = new URLSearchParams(params)
              next.delete('appSearch')
              if (value) next.set('appSearchColumn', value)
              else next.delete('appSearchColumn')
              setParams(next, { replace: true })
            }}
            selectedItemId={appId}
            setSelectedItemId={openApp}
            showAddBtn={false}
            showUpdateBtn={false}
            showRemoveBtn={false}
            renderItems={(item) => (
              <List.Item>
                <Tooltip title={item.name}>
                  <List.Item.Meta
                    title={item.name}
                    description={`ID: ${item.id}`}
                  />
                </Tooltip>
              </List.Item>
            )}
          />
        </div>
        <div key={appId} className="applications-content__details">
          {renderDetails()}
        </div>
      </div>
      {((dialog === 'new-app' && canAdd) ||
        (dialog === 'edit-app' && app && canEdit)) && (
        <AppModal
          key={`${dialog}-${appId}`}
          open
          title={
            dialog === 'new-app'
              ? 'Новое приложение'
              : 'Редактирование приложения'
          }
          groupName={group.name}
          app={dialog === 'edit-app' ? app : undefined}
          onClose={closeDialog}
          onOk={saveApp}
        />
      )}
    </section>
  )
}

export default ApplicationsContent
