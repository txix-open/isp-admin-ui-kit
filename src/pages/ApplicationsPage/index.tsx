import { message, Spin } from 'antd'
import { Column, EmptyData, ColumnItem, SortItemType } from 'isp-ui-kit'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import SearchAppByToken from '@ui/SearchAppByToken'

import ListItem from '@widgets/ListItem'

import ApplicationsContent from '@components/ApplicationsContent'

import {
  ApplicationsGroupType,
  NewApplicationsGroupType,
  UpdateApplicationsGroupType
} from '@pages/ApplicationsPage/applications.type'

import { setUrlValue, setSelectedItemId } from '@utils/columnLayoutUtils'
import { filterFirstColumnItems } from '@utils/firstColumnUtils'

import useRole from '@hooks/useRole'

import applicationsGroupApi from '@services/applicationsGroupService'
import applicationsApi from '@services/applicationsService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import AppGroupModal from 'src/components/AppGroupModal'

import './applications-page.scss'
import { useAppDispatch } from '@hooks/redux'

const searchFieldOptions = [
  { value: 'group', label: 'По группам' },
  { value: 'app', label: 'По приложениям' }
] as unknown as SortItemType<ApplicationsGroupType>[]

const ApplicationsPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { id: selectedItemId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams('')
  const { hasPermission } = useRole()
  const [currentApplicationsApp, setCurrentApplicationsApp] = useState(0)
  const searchType: 'group' | 'app' =
    searchParams.get('searchType') === 'app' || searchParams.get('appSearch')
      ? 'app'
      : 'group'
  const isAppSearch = searchType === 'app'

  const {
    data: applicationsGroup = [],
    isError: isErrorApplicationsGroup,
    isLoading: isLoadingApplicationsGroup
  } = applicationsGroupApi.useGetAllApplicationsGroupQuery()

  const { data: applicationsGetAll = [] } =
    applicationsApi.useApplicationsGetAllQuery()

  const [createApplicationsGroup] =
    applicationsGroupApi.useCreateApplicationsGroupMutation()
  const [updateApplicationsGroup] =
    applicationsGroupApi.useUpdateApplicationsGroupMutation()

  const [deleteApplicationsGroup] =
    applicationsGroupApi.useRemoveApplicationsGroupMutation()

  const isPageAvailable = hasPermission(
    PermissionKeysType.application_group_view
  )
  const canAddGroup = hasPermission(PermissionKeysType.application_group_add)
  const canUpdateGroup = hasPermission(
    PermissionKeysType.application_group_edit
  )
  const canRemoveGroup = hasPermission(
    PermissionKeysType.application_group_delete
  )
  const canViewToken = hasPermission(
    PermissionKeysType.application_group_token_view
  )

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.home)
    }
  }, [isPageAvailable])

  const [showApplicationsModal, setShowApplicationsModal] = useState({
    addModal: false,
    updateModal: false
  })
  const columnName = 'applications-group'
  const groupSearchValue = searchParams.get('search') || ''
  const appSearchValue = searchParams.get('appSearch') || ''
  const searchValue = isAppSearch ? appSearchValue : groupSearchValue
  const sortValue = searchParams.get(`${columnName}-sort`) || ''
  const directionValue = searchParams.get(`${columnName}-direction`) || ''

  const currentAppGroup = useMemo(
    () =>
      applicationsGroup.find((group) => group.id.toString() === selectedItemId),
    [applicationsGroup, selectedItemId]
  )

  const columnItems = useMemo(
    () =>
      filterFirstColumnItems(
        applicationsGroup as unknown as ColumnItem<ApplicationsGroupType>[],
        groupSearchValue
      ),
    [applicationsGroup, groupSearchValue]
  )

  const navigateToApplication = (value: string) => {
    const normalizedValue = value.trim().toLowerCase()
    const application = normalizedValue
      ? applicationsGetAll.find(
          (app) =>
            app.name.toLowerCase().trim().includes(normalizedValue) ||
            app.id.toString() === normalizedValue
        )
      : undefined
    const params = new URLSearchParams(searchParams)
    params.delete('appSearchColumn')

    if (normalizedValue) {
      params.set('appSearch', normalizedValue)
    } else {
      params.delete('appSearch')
    }

    if (!application) {
      setSearchParams(params)
      return
    }

    const { id: applicationId, applicationGroupId } = application
    setCurrentApplicationsApp(applicationId)
    navigate({
      pathname: `${routePaths.applicationsGroup}/${applicationGroupId}/${routePaths.application}/${applicationId}`,
      search: params.toString()
    })
  }

  const handleChangeSearchField = (value: string) => {
    const nextSearchType = value === 'app' ? 'app' : 'group'

    if (nextSearchType === searchType) {
      return
    }

    setCurrentApplicationsApp(0)
    setSearchParams((prev) => {
      prev.delete('search')
      prev.delete('appSearch')

      if (nextSearchType === 'app') {
        prev.set('searchType', nextSearchType)
      } else {
        prev.delete('searchType')
      }

      return prev
    })
  }

  const handleSearchValue = (value: string) => {
    if (isAppSearch) {
      navigateToApplication(value)
      return
    }

    setUrlValue(value, setSearchParams, 'search')
  }

  if (isErrorApplicationsGroup) {
    return <EmptyData />
  }

  if (isLoadingApplicationsGroup) {
    return <Spin className="spin" />
  }

  const addApplicationModal = () => {
    setShowApplicationsModal({
      ...showApplicationsModal,
      addModal: true
    })
  }

  const updateApplicationModal = () => {
    setShowApplicationsModal({
      ...showApplicationsModal,
      updateModal: true
    })
  }

  const handleAddApplicationGroup = (data: ApplicationsGroupType) => {
    const newService: NewApplicationsGroupType = {
      name: data.name,
      description: data.description
    }
    createApplicationsGroup(newService)
      .unwrap()
      .then((res) => {
        setSelectedItemId(
          `${routePaths.applicationsGroup}`,
          res.id.toString(),
          searchValue,
          navigate
        )
        setShowApplicationsModal({
          ...showApplicationsModal,
          addModal: false
        })
        message.success('Группа приложений успешно создана')
      })
      .catch(() => message.error('Не удалось создать группу приложений'))
  }

  const handleUpdateApplicationsGroup = (data: ApplicationsGroupType) => {
    const updateService: UpdateApplicationsGroupType = {
      name: data.name,
      description: data.description,
      id: Number(selectedItemId)
    }

    updateApplicationsGroup(updateService)
      .unwrap()
      .then(() => {
        setShowApplicationsModal({
          ...showApplicationsModal,
          updateModal: false
        })
        message.success('Группа приложений успешно отредактирована')
      })
      .catch(() =>
        message.error('Не удалось отредактировать группу приложений')
      )
  }

  const handleRemoveApplicationsGtoup = () => {
    deleteApplicationsGroup({ idList: [Number(selectedItemId)] })
      .unwrap()
      .then(() => {
        message.success('Элемент удален')
        dispatch(applicationsApi.util.invalidateTags(['Applications']))
        navigate(routePaths.applicationsGroup)
      })
      .catch(() => message.error('Ошибка удаления элемента'))
  }

  const renderMainContent = () => {
    if (!selectedItemId) {
      return (
        <div className="empty-data__wrap">
          {canViewToken && <SearchAppByToken />}
          <EmptyData />
        </div>
      )
    }

    return (
      <ApplicationsContent
        selectedItemId={Number(selectedItemId)}
        currentApplicationsApp={currentApplicationsApp}
        setCurrentApplicationsApp={setCurrentApplicationsApp}
      />
    )
  }

  return (
    <main className="applications-page">
      <Column
        columnKey="applications-group"
        sortableFields={[
          { value: 'name', label: 'Наименование' },
          { value: 'id', label: 'Идентификатор' },
          { value: 'createdAt', label: 'Дата создания' },
          { value: 'updatedAt', label: 'Дата обновления' }
        ]}
        searchFields={searchFieldOptions}
        searchFieldValue={searchType}
        onChangeSearchField={handleChangeSearchField}
        sortValue={sortValue as keyof ApplicationsGroupType}
        onChangeSortValue={(value) =>
          setUrlValue(value, setSearchParams, `${columnName}-sort`)
        }
        directionValue={directionValue}
        onChangeDirectionValue={(value) =>
          setUrlValue(value, setSearchParams, `${columnName}-direction`)
        }
        title="Группы приложений"
        searchPlaceholder="Введите имя или id"
        onUpdateItem={updateApplicationModal}
        showUpdateBtn={canUpdateGroup}
        showRemoveBtn={canRemoveGroup}
        showAddBtn={canAddGroup}
        onAddItem={addApplicationModal}
        onRemoveItem={handleRemoveApplicationsGtoup}
        items={columnItems}
        renderItems={(item) => <ListItem item={item} />}
        searchValue={searchValue}
        selectedItemId={selectedItemId}
        setSelectedItemId={(itemId) => {
          setCurrentApplicationsApp(0)
          setSelectedItemId(
            `${routePaths.applicationsGroup}`,
            itemId,
            searchParams.toString(),
            navigate
          )
        }}
        onChangeSearchValue={handleSearchValue}
      />
      {renderMainContent()}
      <AppGroupModal
        onOk={handleAddApplicationGroup}
        title="Добавить группу приложений"
        open={showApplicationsModal.addModal}
        onClose={() =>
          setShowApplicationsModal({
            ...showApplicationsModal,
            addModal: false
          })
        }
      />
      <AppGroupModal
        appGroup={currentAppGroup}
        title="Редактировать группу приложений"
        onOk={handleUpdateApplicationsGroup}
        open={showApplicationsModal.updateModal}
        onClose={() =>
          setShowApplicationsModal({
            ...showApplicationsModal,
            updateModal: false
          })
        }
      />
    </main>
  )
}

export default ApplicationsPage
