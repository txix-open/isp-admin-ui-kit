import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Badge, List, message, Spin, Tag, Tooltip } from 'antd'
import { compareVersions } from 'compare-versions'
import { Layout } from 'isp-ui-kit'
import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'

import ModuleTabs from '@components/ModuleTabs'

import { ModuleType } from '@pages/ModulesPage/module.type.ts'

import { setUrlValue } from '@utils/columnLayoutUtils.ts'
import { filterFirstColumnItems } from '@utils/firstColumnUtils.ts'

import useRole from '@hooks/useRole.tsx'

import modulesServiceApi from '@services/modulesService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'

import './modules-page.scss'

const { Column } = Layout

const ModulesPage = () => {
  const [activeTab, setActiveTab] = useState('configurations')
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
    )
    switch (url) {
      case 'configurations':
        return setActiveTab('configurations')
      case 'connections':
        return setActiveTab('connections')
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
