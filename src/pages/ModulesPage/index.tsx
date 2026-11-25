import { Alert, Badge, Button, List, message, Tooltip } from 'antd'
import { Column } from 'isp-ui-kit'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'

import { MODULES_TAB_KEYS } from '@constants/modules'

import ModuleTabs from '@components/ModuleTabs'
import PageLayout, {
  PageBackButton,
  PageAccessDenied,
  PageLoading
} from '@components/PageLayout'

import { ModuleType } from '@pages/ModulesPage/module.type'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { setUrlValue } from '@utils/columnLayoutUtils'
import { irreversibleDelete } from '@utils/deleteConfirmation'
import { filterFirstColumnItems } from '@utils/firstColumnUtils'
import { getModuleScrollState } from '@utils/moduleNavigation'

import useRole from '@hooks/useRole'

import modulesServiceApi from '@services/modulesService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import ModuleSummary, { ModuleVersion } from './ModuleSummary'
import './modules-page.scss'

const ModulesPage = () => {
  const { id: selectedItemId = '' } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = useRole()
  const isPageAvailable = hasPermission(PermissionKeysType.module_view)
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    data: ModulesList = [],
    isLoading: isModulesLoading,
    isError,
    refetch
  } = modulesServiceApi.useGetModulesQuery('modules', {
    skip: !isPageAvailable,
    pollingInterval: 5000,
    skipPollingIfUnfocused: true
  })
  const [removeModule, { isLoading: isRemoving }] =
    modulesServiceApi.useRemoveModuleMutation()
  const location = useLocation()
  const activeTab = location.pathname.endsWith('/connections')
    ? MODULES_TAB_KEYS.connections
    : MODULES_TAB_KEYS.configurations

  const searchValue = searchParams.get('search') || ''
  const sortValue = searchParams.get('sort') || ''
  const directionValue = searchParams.get('direction') || ''
  const canRemoveModule = hasPermission(PermissionKeysType.module_delete)
  const isLoading = isModulesLoading

  const setSelectedItemId = (id: string): void => {
    const params = new URLSearchParams(searchParams)
    if (id) {
      navigate({
        pathname: `${routePaths.modules}/${id}/${activeTab}`,
        search: params.toString()
      })
    }
  }

  const handleOnChangeSearchValue = (value: string): void => {
    setUrlValue(value, setSearchParams, 'search')
  }

  const handleRemoveModule = (id: string) => {
    if (!canRemoveModule || isRemoving) return
    return removeModule(id)
      .unwrap()
      .then(() => {
        navigate(routePaths.modules)
        message.success('Модуль удалён').then()
        setSelectedItemId('')
      })
      .catch((error) => notifyApiError(error, 'Не удалось удалить модуль'))
  }

  const handleOpenModuleRelations = (): void => {
    navigate(routePaths.modulesRelations, {
      state: {
        moduleReturnTo: location.pathname + location.search,
        ...getModuleScrollState()
      }
    })
  }

  if (!isPageAvailable) return <PageAccessDenied title="Модули" />

  if (isLoading) {
    return (
      <PageLayout title="Модули">
        <PageLoading label="Загрузка модулей…" />
      </PageLayout>
    )
  }

  const currentModule = ModulesList.find(
    (item: ModuleType) => item.id.toString() === selectedItemId
  )

  const renderItems = (item: ModuleType) => {
    const instances = item.status?.length ?? 0
    return (
      <List.Item>
        <Tooltip mouseEnterDelay={1} title={item.name}>
          <List.Item.Meta
            title={
              <div className="module-item__name">
                <span>{item.name}</span>
                <ModuleVersion module={item} />
              </div>
            }
            description={
              <div className="module-item__content">
                <span>Активные экземпляры:</span>
                <Badge
                  size="small"
                  className="module-item__count"
                  showZero
                  count={instances}
                  styles={{
                    indicator: {
                      backgroundColor: instances
                        ? 'var(--ant-color-primary-bg)'
                        : 'var(--ant-color-error-bg)',
                      color: instances
                        ? 'var(--ant-color-primary-text)'
                        : 'var(--ant-color-error-text)'
                    }
                  }}
                />
              </div>
            }
          />
        </Tooltip>
      </List.Item>
    )
  }
  return (
    <PageLayout
      split
      className="page-layout--local-scroll"
      title="Модули"
      actions={
        <Button type="text" onClick={handleOpenModuleRelations}>
          Карта связей
        </Button>
      }
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось обновить модули"
          action={<Button onClick={() => refetch()}>Повторить</Button>}
        />
      )}
      <div className="modules-page" data-selected={Boolean(selectedItemId)}>
        <Column
          sortableFields={[
            { value: 'name', label: 'Наименование' },
            { value: 'active', label: 'Активные экземпляры' }
          ]}
          sortValue={sortValue as keyof ModuleType}
          onChangeSortValue={(value) =>
            setUrlValue(value, setSearchParams, 'sort')
          }
          directionValue={directionValue}
          onChangeDirectionValue={(value) =>
            setUrlValue(value, setSearchParams, 'direction')
          }
          title="Модули"
          searchPlaceholder="Введите имя или id"
          items={filterFirstColumnItems(ModulesList, searchValue)}
          showAddBtn={false}
          showUpdateBtn={false}
          showRemoveBtn={canRemoveModule}
          onRemoveItem={handleRemoveModule}
          loadingRemove={isRemoving}
          removeConfirmDescription={
            currentModule
              ? `Удалить модуль «${currentModule.name}»? ${irreversibleDelete}`
              : undefined
          }
          onChangeSearchValue={handleOnChangeSearchValue}
          renderItems={renderItems}
          searchValue={searchValue}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
        />
        <div className="modules-page__detail-panel workspace-card">
          <PageBackButton
            className="modules-page__back-to-list"
            onClick={() =>
              navigate({
                pathname: routePaths.modules,
                search: searchParams.toString()
              })
            }
          >
            К списку модулей
          </PageBackButton>
          {currentModule && (
            <ModuleSummary
              module={currentModule}
              search={searchParams.toString()}
            />
          )}
          <ModuleTabs
            searchParams={searchParams}
            currentModule={currentModule}
            activeTab={activeTab}
          />
        </div>
      </div>
    </PageLayout>
  )
}

export default ModulesPage
