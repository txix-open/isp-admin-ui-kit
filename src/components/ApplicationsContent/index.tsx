import { FileProtectOutlined } from '@ant-design/icons'
import { List, message, Spin, Tooltip } from 'antd'
import { Layout, ColumnItem } from 'isp-ui-kit'
import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppModal from '@components/AppModal'
import TokenContent from '@components/TokenContent'
import { ApplicationAppType, ApplicationsServiceType, NewApplicationAppType, UpdateApplicationAppType } from '@pages/ApplicationsPage/applications.type.ts'
import { setSearchValue, setSelectedItemId } from '@utils/columnLayoutUtils.ts'
import { filterFirstColumnItems } from '@utils/firstColumnUtils.ts'
import useRole from '@hooks/useRole.tsx'
import applicationsApi from '@services/applicationsService.ts'
import { routePaths } from '@routes/routePaths.ts'
import { PermissionKeysType } from '@type/roles.type.ts'
import './applications-content.scss'

const { EmptyData, Column } = Layout

interface ApplicationsContentPropTypes {
  selectedItemId: number
  currentApplicationsApp: number
  setCurrentApplicationsApp: Dispatch<SetStateAction<number>>
}

const ApplicationsContent: FC<ApplicationsContentPropTypes> = ({
  selectedItemId,
  setCurrentApplicationsApp
}) => {
  const { hasPermission } = useRole()
  const [isExistsId, setIsExistsId] = useState<{
    field: keyof ApplicationAppType
    message: string
  } | null>(null)

  const {
    data: applications = [],
    isLoading: isLoadingApplicationsContent = []
  } = applicationsApi.useGetApplicationsByServiceIdQuery({
    id: selectedItemId
  })

  const [createApplicationService] =
    applicationsApi.useCreateApplicationServiceMutation()
  const [updateApplication] =
    applicationsApi.useUpdateApplicationsServiceMutation()
  const [removeApplicationsService] =
    applicationsApi.useRemoveApplicationsServiceMutation()
  const [showApplicationsModal, setShowApplicationsModal] = useState({
    addModal: false,
    updateModal: false
  })
  const [searchParams, setSearchParams] = useSearchParams('')
  const searchAppValue = searchParams.get('appSearch') || ''
  const navigate = useNavigate()
  const { appId = '' } = useParams()

  const canAddApp = hasPermission(PermissionKeysType.application_group_app_add)
  const canUpdateApp = hasPermission(
    PermissionKeysType.application_group_app_edit
  )
  const canRemoveApp = hasPermission(
    PermissionKeysType.application_group_app_delete
  )
  const isTokenPageAvailable = hasPermission(
    PermissionKeysType.application_group_token_view
  )

  const isAppAccessPageAvailable = hasPermission(
    PermissionKeysType.app_access_view
  )

  const currentApp = useMemo(() => {
    const element = applications.find(
      (application) => application.app.id.toString() === appId
    )
    return element ? element.app : undefined
  }, [applications, appId])

  const updateApplicationModal = () => {
    setShowApplicationsModal({
      ...showApplicationsModal,
      updateModal: true
    })
  }
  const addApplicationModal = () => {
    setShowApplicationsModal({
      ...showApplicationsModal,
      addModal: true
    })
  }
  const renderTokenContent = () => {
    if (!appId) {
      return <EmptyData />
    }

    if (!isTokenPageAvailable) {
      return (
        <div className="empty-data">
          <h1>Нет доступа к разделу</h1>
        </div>
      )
    }

    return <TokenContent key={appId} id={Number(appId)} />
  }

  const handleUpdateApplicationApp = (data: ApplicationAppType) => {
    if (currentApp) {
      const updateApplications: UpdateApplicationAppType = {
        newId: data.id,
        oldId: currentApp.id,
        name: data.name,
        description: data.description
      }
      updateApplication(updateApplications)
        .unwrap()
        .then(() => {
          setShowApplicationsModal({
            ...showApplicationsModal,
            updateModal: false
          })
          navigate(`${routePaths.applicationsGroup}/${selectedItemId}/${routePaths.application}/${data.id}`, { replace: true })
          setIsExistsId(null)
          message.success('Элемент сохранен')
        })
        .catch((e) => {
          if(e.response.data.errorCode === 604) {
            setIsExistsId({
              field: 'id',
              message: 'Приложение с таким идентификатором уже существует'
            })
          } else {
            message.error('Ошибка обновления элемента')
            setIsExistsId(null)
          }
        })
    }
  }

  const handleCreateApplicationApp = (data: ApplicationAppType) => {

    const newApplicationApp: NewApplicationAppType = {
      name: data.name,
      id: data.id,
      description: data.description,
      applicationGroupId: selectedItemId,
      type: 'SYSTEM'
    }

    createApplicationService(newApplicationApp)
      .unwrap()
      .then(() => {
        message.success('Элемент сохранен')
        setShowApplicationsModal({
          ...showApplicationsModal,
          addModal: false
        })
      })
      .catch((e) => {
        if(e.response.data.errorCode === 604) {
          setIsExistsId({
            field: 'id',
            message: 'Приложение с таким идентификатором уже существует'
          })
        } else {
          message.error('Ошибка создания элемента')
        }
      })
  }

  const handleRemoveApplicationApp = (id: number) =>
    removeApplicationsService([id])
      .unwrap()
      .then(() => {
        message.success('Элемент удален')
        navigate(
          `${routePaths.applicationsGroup}/${selectedItemId}/${routePaths.application}`
        )
      })
      .catch(() => message.error('Ошибка удаления элемента'))

  const renderColumnItems = (item: ColumnItem<any>) => {
    return (
      <List.Item>
        <Tooltip mouseEnterDelay={1.3} title={item.name}>
          <List.Item.Meta
            title={item.name}
            description={<span>id: {item.id}</span>}
          />
          {isAppAccessPageAvailable && (
            <div
              className="link-btn"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`${routePaths.appAccess}/${item.id}`)
              }}
            >
              <Tooltip title="Доступы приложений">
                <FileProtectOutlined />
              </Tooltip>
            </div>
          )}
        </Tooltip>
      </List.Item>
    )
  }

  if (!selectedItemId) {
    return <EmptyData />
  }
  if (selectedItemId)
    if (isLoadingApplicationsContent) {
      return <Spin className="spin" />
    }

  return (
    <section className="applications-content">
      <Column
        title="Приложения"
        searchPlaceholder="Введите имя или id"
        onUpdateItem={updateApplicationModal}
        showUpdateBtn={canUpdateApp}
        showRemoveBtn={canRemoveApp}
        showAddBtn={canAddApp}
        onAddItem={addApplicationModal}
        onRemoveItem={() => handleRemoveApplicationApp(Number(appId))}
        items={filterFirstColumnItems(
          applications?.map((el) => {
            return el.app
          }) as unknown as ColumnItem<ApplicationsServiceType>[],
          searchAppValue
        )}
        renderItems={renderColumnItems}
        searchValue={searchAppValue}
        selectedItemId={appId}
        setSelectedItemId={(itemId: string) => {
          setCurrentApplicationsApp(Number(itemId))
          setSelectedItemId(
            `${routePaths.applicationsGroup}/${selectedItemId}/${routePaths.application}`,
            itemId.toString(),
            searchAppValue,
            navigate
          )
        }}
        onChangeSearchValue={(value: string) => {
          setSearchValue(
            value.trim().toLowerCase(),
            setSearchParams,
            'appSearch'
          )
        }}
      />
      {renderTokenContent()}
      <AppModal
        isExistsId={isExistsId}
        app={currentApp}
        onOk={handleUpdateApplicationApp}
        title="Редактировать приложение"
        open={showApplicationsModal.updateModal}
        onClose={() =>
          setShowApplicationsModal({
            ...showApplicationsModal,
            updateModal: false
          })
        }
      />
      <AppModal
        isExistsId={isExistsId}
        isNew
        onOk={handleCreateApplicationApp}
        title="Добавить приложение"
        open={showApplicationsModal.addModal}
        onClose={() =>
          setShowApplicationsModal({
            ...showApplicationsModal,
            addModal: false
          })
        }
      />
    </section>
  )
}

export default ApplicationsContent
