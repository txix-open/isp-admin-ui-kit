import { FileProtectOutlined } from '@ant-design/icons'
import { List, message, Spin, Tooltip } from 'antd'
import { Layout } from 'isp-ui-kit'
import { ColumnItem } from 'isp-ui-kit/dist/Layout/Column/column.type'
import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AppModal from '@components/AppModal'
import TokenContent from '@components/TokenContent'

import {
  ApplicationAppType,
  ApplicationsServiceType,
  NewApplicationAppType,
  UpdateApplicationAppType
} from '@pages/ApplicationsPage/applications.type.ts'

import { setSearchValue, setSelectedItemId } from '@utils/columnLayoutUtils.ts'
import { filterFirstColumnItems } from '@utils/firstColumnUtils.ts'

import applicationsApi from '@services/applicationsService.ts'

import { routePaths } from '@routes/routePaths.ts'

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

    return <TokenContent key={appId} id={Number(appId)} />
  }

  const handleUpdateApplicationApp = (data: ApplicationAppType) => {
    if (currentApp) {
      const updateApplications: UpdateApplicationAppType = {
        id: currentApp.id,
        name: data.name,
        description: data.description
          ? data.description
          : currentApp.description,
        serviceId: selectedItemId,
        type: 'SYSTEM'
      }
      updateApplication({ ...currentApp, ...updateApplications })
        .unwrap()
        .then(() => {
          setShowApplicationsModal({
            ...showApplicationsModal,
            updateModal: false
          })
          message.success('Элемент сохранен')
        })
        .catch(() => message.error('Ошибка обновления элемента'))
    }
  }

  const handleCreateApplicationApp = (data: ApplicationAppType) => {
    const newApplicationApp: NewApplicationAppType = {
      name: data.name,
      description: data.description,
      serviceId: selectedItemId,
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
      .catch(() => message.error('Ошибка добавления элемента'))
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
          <div
            className="link-btn"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/appAccess/${item.id}`)
            }}
          >
            <Tooltip title="Доступы приложений">
              <FileProtectOutlined />
            </Tooltip>
          </div>
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
        showUpdateBtn={true}
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
