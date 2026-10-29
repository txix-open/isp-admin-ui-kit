import { Alert, Button, Empty, message, Result, Select, Spin } from 'antd'
import { Column } from 'isp-ui-kit'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import ListItem from '@widgets/ListItem'

import AppGroupModal from '@components/AppGroupModal'
import ApplicationsContent from '@components/ApplicationsContent'
import ApplicationEmptyPanel from '@components/ApplicationsContent/ApplicationEmptyPanel'
import PageLayout from '@components/PageLayout'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { setUrlValue } from '@utils/columnLayoutUtils'
import { filterFirstColumnItems } from '@utils/firstColumnUtils'

import { useAppDispatch } from '@hooks/redux'
import useRole from '@hooks/useRole'

import applicationsGroupApi from '@services/applicationsGroupService'
import applicationsApi from '@services/applicationsService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import './applications-page.scss'
import {
  ApplicationsGroupType,
  NewApplicationsGroupType
} from './applications.type'
import { useApplicationDialog } from './useApplicationDialog'

const ApplicationsPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { id = '', appId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { dialog, openDialog, closeDialog } = useApplicationDialog()
  const { hasPermission } = useRole()
  const canView = hasPermission(PermissionKeysType.application_group_view)
  const canAdd = hasPermission(PermissionKeysType.application_group_add)
  const canEdit = hasPermission(PermissionKeysType.application_group_edit)
  const canRemove = hasPermission(PermissionKeysType.application_group_delete)
  const canViewToken = hasPermission(
    PermissionKeysType.application_group_token_view
  )
  const isAppSearch =
    params.get('searchType') === 'app' || Boolean(params.get('appSearch'))
  const search = params.get(isAppSearch ? 'appSearch' : 'search') ?? ''
  const groups = applicationsGroupApi.useGetAllApplicationsGroupQuery(
    undefined,
    { skip: !canView }
  )
  const apps = applicationsApi.useApplicationsGetAllQuery(undefined, {
    skip: !canView || !isAppSearch
  })
  const [createGroup, createState] =
    applicationsGroupApi.useCreateApplicationsGroupMutation()
  const [updateGroup, updateState] =
    applicationsGroupApi.useUpdateApplicationsGroupMutation()
  const [deleteGroup, deleteState] =
    applicationsGroupApi.useRemoveApplicationsGroupMutation()
  const busy =
    createState.isLoading || updateState.isLoading || deleteState.isLoading
  const group = groups.data?.find((item) => String(item.id) === id)
  const matchingAppGroups = new Set(
    (apps.data ?? [])
      .filter(
        (app) =>
          app.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          String(app.id) === search.trim()
      )
      .map((app) => app.applicationGroupId)
  )
  const items =
    isAppSearch && search.trim()
      ? (groups.data ?? []).filter((item) => matchingAppGroups.has(item.id))
      : filterFirstColumnItems(groups.data ?? [], search)

  const openGroup = (groupId: string, replace = false) => {
    const next = new URLSearchParams(params)
    next.delete('dialog')
    next.delete('appSearchColumn')
    navigate(
      {
        pathname: groupId
          ? `${routePaths.applicationsGroup}/${groupId}`
          : routePaths.applicationsGroup,
        search: next.toString()
      },
      { replace }
    )
  }
  const changeSearchType = (value: string) => {
    const next = new URLSearchParams(params)
    next.delete('search')
    next.delete('appSearch')
    if (value === 'app') next.set('searchType', 'app')
    else next.delete('searchType')
    setParams(next, { replace: true })
  }
  const saveGroup = (values: NewApplicationsGroupType) => {
    if (busy || (dialog === 'new-group' ? !canAdd : !canEdit))
      return Promise.resolve()
    const request =
      dialog === 'new-group'
        ? createGroup(values).unwrap()
        : updateGroup({ ...values, id: Number(id) }).unwrap()
    return request
      .then((result) => {
        if (dialog === 'new-group' && result) openGroup(String(result.id), true)
        else closeDialog()
        message.success(
          dialog === 'new-group'
            ? 'Группа приложений создана'
            : 'Изменения группы сохранены'
        )
      })
      .catch((error) =>
        notifyApiError(error, 'Не удалось сохранить группу приложений')
      )
  }
  const removeGroup = () => {
    if (!group || !canRemove || busy) return
    return deleteGroup({ idList: [group.id] })
      .unwrap()
      .then(() => {
        dispatch(applicationsApi.util.invalidateTags(['Applications']))
        openGroup('', true)
        message.success('Группа приложений удалена')
      })
      .catch((error) =>
        notifyApiError(error, 'Не удалось удалить группу приложений')
      )
  }

  const renderDetails = () => {
    if (groups.isLoading)
      return (
        <Spin description="Загрузка групп">
          <div style={{ minHeight: 160 }} />
        </Spin>
      )
    if (groups.isError && !groups.data)
      return (
        <Empty description="Список групп недоступен. Повторите загрузку." />
      )
    if (!id)
      return (
        <ApplicationEmptyPanel
          searchToken={canViewToken}
          description="Выберите группу, чтобы увидеть её приложения"
        />
      )
    if (!group)
      return (
        <Result
          status="404"
          title="Группа не найдена"
          extra={<Button onClick={() => openGroup('')}>К группам</Button>}
        />
      )
    return (
      <ApplicationsContent
        key={group.id}
        group={group}
        onBackToGroups={() => openGroup('')}
      />
    )
  }

  if (!canView)
    return <Result status="403" title="Нет доступа к приложениям и группам" />
  return (
    <PageLayout
      split
      className="applications-screen"
      title="Приложения и группы"
      focusOnMount={!id}
      actions={
        <>
          <Button onClick={() => groups.refetch()} loading={groups.isFetching}>
            Обновить группы
          </Button>
          {canAdd && (
            <Button
              type="primary"
              onClick={() => openDialog('new-group')}
              disabled={busy}
            >
              Новая группа
            </Button>
          )}
        </>
      }
    >
      {groups.isError && (
        <Alert
          type="error"
          showIcon
          title={
            groups.data
              ? 'Не удалось обновить группы. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить группы приложений'
          }
          action={
            <Button
              loading={groups.isFetching}
              onClick={() => groups.refetch()}
            >
              Повторить
            </Button>
          }
        />
      )}
      {isAppSearch && apps.isError && (
        <Alert
          type="warning"
          showIcon
          title="Поиск по приложениям недоступен"
          action={
            <Button loading={apps.isFetching} onClick={() => apps.refetch()}>
              Повторить
            </Button>
          }
        />
      )}
      <section
        className="applications-page"
        data-group-selected={Boolean(id)}
        data-app-selected={Boolean(appId)}
      >
        <div className="applications-page__groups">
          <div className="applications-page__search-scope">
            <Select
              aria-label="Область поиска"
              value={isAppSearch ? 'app' : 'group'}
              options={[
                { value: 'group', label: 'По группам' },
                { value: 'app', label: 'По приложениям' }
              ]}
              onChange={changeSearchType}
            />
          </div>
          <Column<ApplicationsGroupType>
            columnKey="applications-group"
            title="Группы"
            isLoading={groups.isLoading || (isAppSearch && apps.isLoading)}
            sortableFields={[
              { value: 'name', label: 'Название' },
              { value: 'id', label: 'Идентификатор' },
              { value: 'createdAt', label: 'Дата создания' },
              { value: 'updatedAt', label: 'Дата обновления' }
            ]}
            sortValue={
              params.get(
                'applications-group-sort'
              ) as keyof ApplicationsGroupType
            }
            onChangeSortValue={(value) =>
              setUrlValue(value, setParams, 'applications-group-sort')
            }
            directionValue={params.get('applications-group-direction') ?? ''}
            onChangeDirectionValue={(value) =>
              setUrlValue(value, setParams, 'applications-group-direction')
            }
            searchPlaceholder={
              isAppSearch
                ? 'Название или ID приложения'
                : 'Название или ID группы'
            }
            searchValue={search}
            onChangeSearchValue={(value) =>
              setUrlValue(
                value,
                setParams,
                isAppSearch ? 'appSearch' : 'search'
              )
            }
            items={items}
            selectedItemId={id}
            setSelectedItemId={openGroup}
            showAddBtn={false}
            showUpdateBtn={canEdit && !busy}
            onUpdateItem={() => openDialog('edit-group')}
            showRemoveBtn={canRemove}
            onRemoveItem={removeGroup}
            loadingRemove={busy}
            removeConfirmDescription={
              group
                ? `Группа «${group.name}». Это действие нельзя отменить.`
                : undefined
            }
            renderItems={(item) => <ListItem item={item} />}
          />
        </div>
        <div className="applications-page__details">{renderDetails()}</div>
      </section>
      {((dialog === 'new-group' && canAdd) ||
        (dialog === 'edit-group' && group && canEdit)) && (
        <AppGroupModal
          key={`${dialog}-${id}`}
          open
          title={
            dialog === 'new-group'
              ? 'Новая группа приложений'
              : 'Редактирование группы'
          }
          appGroup={dialog === 'edit-group' ? group : undefined}
          onClose={closeDialog}
          onOk={saveGroup}
        />
      )}
    </PageLayout>
  )
}

export default ApplicationsPage
