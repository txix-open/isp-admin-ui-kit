import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Result } from 'antd'
import { Column, EmptyData } from 'isp-ui-kit'
import { memo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import ListItem from '@widgets/ListItem'

import AppAccessContent from '@components/AppAccessContent'
import PageLayout, { PageLoading } from '@components/PageLayout'

import { ApplicationAppType } from '@pages/ApplicationsPage/applications.type'

import { setUrlValue, setSelectedItemId } from '@utils/columnLayoutUtils'
import { filterFirstColumnItems } from '@utils/firstColumnUtils'

import useRole from '@hooks/useRole'

import applicationsApi from '@services/applicationsService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import './app-access-page.scss'

const firstColumnSearchParam = 'search'
const findMethodParam = 'method'

const AppAccessPage = () => {
  const navigate = useNavigate()
  const { hasPermission } = useRole()

  const { id: selectedItemId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchValue = searchParams.get(firstColumnSearchParam) || ''
  const sortValue = searchParams.get('sort') || ''
  const directionValue = searchParams.get('direction') || ''
  const canRead = hasPermission(PermissionKeysType.app_access_view)

  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    refetch
  } = applicationsApi.useGetAllApplicationsServiceQuery(undefined, {
    skip: !canRead
  })

  const handleOnChangeSearchValue = (value: string): void => {
    setUrlValue(value, setSearchParams, 'search')
  }

  const onSelectedItemId = (id: string): void => {
    const params = new URLSearchParams(searchParams)
    params.delete(findMethodParam)
    setSelectedItemId(routePaths.appAccess, id, params.toString(), navigate)
  }

  if (!canRead)
    return <Result status="403" title="Нет доступа к правам приложений" />
  if (isLoading) {
    return (
      <PageLayout title="Доступы приложений">
        <PageLoading label="Загрузка приложений…" />
      </PageLayout>
    )
  }

  if (isError && !data.length) {
    return (
      <PageLayout title="Доступы приложений">
        <Result
          status="error"
          title="Не удалось загрузить приложения"
          extra={
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Повторить
            </Button>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Доступы приложений"
      split
      className="page-layout--local-scroll"
    >
      {isError && (
        <Alert
          type="warning"
          showIcon
          title="Не удалось обновить список приложений"
          action={
            <Button loading={isFetching} onClick={() => refetch()}>
              Повторить
            </Button>
          }
        />
      )}
      <div className="app-access-page" data-selected={Boolean(selectedItemId)}>
        <Column
          sortableFields={[
            { value: 'name', label: 'Наименование' },
            { value: 'id', label: 'Идентификатор' }
          ]}
          sortValue={sortValue as keyof ApplicationAppType}
          onChangeSortValue={(value) =>
            setUrlValue(value, setSearchParams, 'sort')
          }
          directionValue={directionValue}
          onChangeDirectionValue={(value) =>
            setUrlValue(value, setSearchParams, 'direction')
          }
          title="Приложения"
          searchPlaceholder="Введите имя или id"
          showUpdateBtn={false}
          showAddBtn={false}
          showRemoveBtn={false}
          items={filterFirstColumnItems(data, searchValue)}
          renderItems={(item) => <ListItem item={item} />}
          searchValue={searchValue}
          selectedItemId={selectedItemId}
          setSelectedItemId={onSelectedItemId}
          onChangeSearchValue={handleOnChangeSearchValue}
        />
        <div className="app-access-page__content-wrap workspace-card">
          <Button
            className="app-access-page__back-to-list"
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate({
                pathname: routePaths.appAccess,
                search: searchParams.toString()
              })
            }
          >
            К списку приложений
          </Button>
          {selectedItemId ? (
            <AppAccessContent
              paramPrefix={findMethodParam}
              key={`content-${selectedItemId}`}
              id={Number(selectedItemId)}
              name={data.find((app) => String(app.id) === selectedItemId)?.name}
            />
          ) : (
            <EmptyData />
          )}
        </div>
      </div>
    </PageLayout>
  )
}

export default memo(AppAccessPage)
