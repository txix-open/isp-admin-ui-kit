import { message, Spin } from 'antd'
import { Layout } from 'isp-ui-kit'
import { ColumnItem } from 'isp-ui-kit/dist/Layout/Column/column.type'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import ListItem from '@widgets/ListItem'

import ApplicationsContent from '@components/ApplicationsContent'

import {
  ApplicationsGroupType,
  NewApplicationsGroupType,
  UpdateApplicationsGroupType
} from '@pages/ApplicationsPage/applications.type.ts'

import { setSearchValue, setSelectedItemId } from '@utils/columnLayoutUtils.ts'
import { filterFirstColumnItems } from '@utils/firstColumnUtils.ts'

import useRole from '@hooks/useRole.tsx'

import applicationsGroupApi from '@services/applicationsGroupService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'

import AppGroupModal from 'src/components/AppGroupModal'

import './applications-page.scss'

const { Column, EmptyData } = Layout

const ApplicationsPage = () => {
  const navigate = useNavigate()
  const { id: selectedItemId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams('')
  const { hasPermission } = useRole()
  const [currentApplicationsApp, setCurrentApplicationsApp] = useState(0)

  const {
    data: applicationsGroup = [],
    isError: isErrorApplicationsGroup,
    isLoading: isLoadingApplicationsGroup
  } = applicationsGroupApi.useGetApplicationsGroupByDomainIdQuery({ id: 1 })

  const [createApplicationsGroup] =
    applicationsGroupApi.useCreateApplicationsGroupMutation()
  const [updateApplicationsGroup] =
    applicationsGroupApi.useUpdateApplicationsGroupMutation()

  const [deleteApplicationsGroup] =
    applicationsGroupApi.useRemoveApplicationsGroupMutation()

  const isPageAvailable = hasPermission(PermissionKeysType.read)
  // const hasRevokePermission = hasPermission(PermissionKeysType.write)

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.home)
    }
  }, [isPageAvailable])

  const [showApplicationsModal, setShowApplicationsModal] = useState({
    addModal: false,
    updateModal: false
  })
  const searchValue = searchParams.get('search') || ''

  const currentAppGroup = useMemo(
    () =>
      applicationsGroup.find((group) => group.id.toString() === selectedItemId),
    [applicationsGroup, selectedItemId]
  )

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
      description: data.description,
      domainId: 1
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
      domainId: 1,
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
    deleteApplicationsGroup([Number(selectedItemId)])
      .unwrap()
      .then(() => {
        message.success('Элемент удален')
        navigate(routePaths.applicationsGroup)
      })
      .catch(() => message.error('Ошибка удаления элемента'))
  }

  const renderMainContent = () => {
    if (!selectedItemId) {
      return <EmptyData />
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
        title="Группы приложений"
        searchPlaceholder="Введите имя или id"
        onUpdateItem={updateApplicationModal}
        showUpdateBtn={true}
        onAddItem={addApplicationModal}
        onRemoveItem={handleRemoveApplicationsGtoup}
        items={filterFirstColumnItems(
          applicationsGroup as unknown as ColumnItem<ApplicationsGroupType>[],
          searchValue
        )}
        renderItems={(item) => <ListItem item={item} />}
        searchValue={searchValue}
        selectedItemId={selectedItemId}
        setSelectedItemId={(itemId) => {
          setCurrentApplicationsApp(0)
          setSelectedItemId(
            `${routePaths.applicationsGroup}`,
            itemId,
            searchValue,
            navigate
          )
        }}
        onChangeSearchValue={(value) => setSearchValue(value, setSearchParams)}
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
