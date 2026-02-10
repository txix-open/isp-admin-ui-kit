import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Badge, List, message, Spin, Tag, Tooltip } from 'antd'
import { compareVersions } from 'compare-versions'
import { Column } from 'isp-ui-kit'
import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'

import { MODULES_TAB_KEYS, ModulesTabKeysType } from '@constants/modules'

import ModuleTabs from '@components/ModuleTabs'

import { ModuleType } from '@pages/ModulesPage/module.type'

import { setUrlValue } from '@utils/columnLayoutUtils'
import { filterFirstColumnItems } from '@utils/firstColumnUtils'

import useRole from '@hooks/useRole'

import modulesServiceApi from '@services/modulesService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import './modules-page.scss'

const ModulesPage = () => {
  const [activeTab, setActiveTab] = useState(MODULES_TAB_KEYS.configurations)
  const { id: selectedItemId = '' } = useParams()
  const navigate = useNavigate()
  const { role, hasPermission } = useRole()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: ModulesList = [], isLoading: isModulesLoading } =
    modulesServiceApi.useGetModulesQuery('modules', {
      pollingInterval: 5000,
      skipPollingIfUnfocused: true
    })
  const [removeModule] = modulesServiceApi.useRemoveModuleMutation()
  const location = useLocation()

  const searchValue = searchParams.get('search') || ''
  const sortValue = searchParams.get('sort') || ''
  const directionValue = searchParams.get('direction') || ''
  const isPageAvailable = hasPermission(PermissionKeysType.module_view)
  const canRemoveModule = hasPermission(PermissionKeysType.module_delete)
  const isLoading = isModulesLoading

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.profile)
      message.error('Страница не найдена')
    }
  }, [isPageAvailable])

  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  useEffect(() => {
    const url = location.pathname.substring(
      location.pathname.lastIndexOf('/') + 1
    ) as ModulesTabKeysType
    switch (url) {
      case MODULES_TAB_KEYS.configurations:
        return setActiveTab(MODULES_TAB_KEYS.configurations)
      case MODULES_TAB_KEYS.connections:
        return setActiveTab(MODULES_TAB_KEYS.connections)
      case MODULES_TAB_KEYS.swagger:
        return setActiveTab(MODULES_TAB_KEYS.swagger)
    }
  }, [location])

  const setSelectedItemId = (id: string): void => {
    const params = new URLSearchParams(searchParams)
    if (id) {
      navigate(
        {
          pathname: `${routePaths.modules}/${id}/${activeTab}`,
          search: params.toString()
        },
        { replace: true }
      )
    }
  }

  const handleOnChangeSearchValue = (value: string): void => {
    setUrlValue(value, setSearchParams, 'search')
  }

  const handleRemoveModule = (id: string) => {
    removeModule(id)
      .unwrap()
      .then(() => {
        navigate(routePaths.modules)
        message.success('Модуль успешно удален').then()
        setSelectedItemId('')
      })
      .catch(() => message.error('Не удалось удалить модуль'))
  }

  const versionCompare = (versions: string[]) => {
    const sorted = (versions || ['']).sort(compareVersions)
    const firstVersion = sorted[0]
    for (let i = 1; i < sorted.length; i++) {
      if (compareVersions(firstVersion, sorted[i]) !== 0) {
        return false
      }
    }
    return true
  }

  const getLastVersion = (versions: string[]) => {
    const sorted = (versions || ['']).sort(compareVersions)
    return sorted[sorted.length - 1]
  }

  if (isLoading) {
    return <Spin />
  }

  const currentModule = ModulesList.find(
    (item: ModuleType) => item.id.toString() === selectedItemId
  )

  const renderItems = (item: ModuleType) => {
    const isSame = versionCompare(item?.status?.map((i) => i.version))
    const textTooltip = isSame
      ? 'Активны экземпляры одинаковых версий'
      : 'Активны экземпляры разных версий'
    const lastVersion = getLastVersion(item.status?.map((i) => i.version))

    const renderVersion = () => {
      if (!isSame && lastVersion) {
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="warning">
            {lastVersion}
          </Tag>
        )
      }
      if (isSame && lastVersion) {
        return <Tag color="default">{lastVersion}</Tag>
      }
      return ''
    }

    return (
      <List.Item>
        <Tooltip mouseEnterDelay={1} title={item.name}>
          <List.Item.Meta
            title={
              <div className="module-item__name">
                <span>{item.name}</span>
                <Tooltip
                  overlayInnerStyle={{ width: '300px' }}
                  title={textTooltip}
                >
                  {renderVersion()}
                </Tooltip>
              </div>
            }
            description={
              <div className="module-item__content">
                <span className="module-item__content__description">
                  активные экземпляры:
                </span>
                <Badge
                  size="small"
                  showZero
                  count={(item.status && item.status.length) || 0}
                  color={!item.status || !item.status.length ? '' : 'cyan'}
                />
              </div>
            }
          />
        </Tooltip>
      </List.Item>
    )
  }
  return (
    <section className="modules-page">
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
        onChangeSearchValue={handleOnChangeSearchValue}
        renderItems={renderItems}
        searchValue={searchValue}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
      />
      <ModuleTabs
        searchParams={searchParams}
        currentModule={currentModule}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </section>
  )
}

export default ModulesPage
