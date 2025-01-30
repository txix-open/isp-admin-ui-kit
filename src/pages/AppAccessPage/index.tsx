import { Spin } from 'antd'
import { Layout } from 'isp-ui-kit'
import { ColumnItem } from 'isp-ui-kit/dist/Layout/Column/column.type'
import { memo, useEffect } from 'react'
import {
  createSearchParams,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'

import ListItem from '@widgets/ListItem'

import AppAccessContent from '@components/AppAccessContent'

import { setSearchValue, setSelectedItemId } from '@utils/columnLayoutUtils.ts'
import { filterFirstColumnItems } from '@utils/firstColumnUtils.ts'

import useRole from '@hooks/useRole.tsx'

import appApi from '@services/appService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { SystemTreeAppType } from '@type/app.type.ts'
import { PermissionKeysType } from '@type/roles.type.ts'

import './app-access-page.scss'

const { Column, EmptyData } = Layout

const firstColumnSearchParam = 'search'
const findMethodParam = 'method'

const AppAccessPage = () => {
  const {
    data = { originalResponse: [], appList: [] },
    isLoading,
    isError
  } = appApi.useGetSystemTreeQuery()

  const { appList } = data
  const navigate = useNavigate()
  const { hasPermission } = useRole()

  const { id: selectedItemId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchValue = searchParams.get(firstColumnSearchParam) || ''
  const canRead = hasPermission(PermissionKeysType.read)

  useEffect(() => {
    if (!canRead) {
      navigate(routePaths.home)
    }
  }, [canRead])

  const handleOnChangeSearchValue = (value: string): void => {
    setSearchValue(value, setSearchParams)
  }

  const onSelectedItemId = (id: string): void => {
    setSearchValue('', setSearchParams, findMethodParam)
    setSelectedItemId(
      routePaths.appAccess,
      id,
      createSearchParams(searchParams).toString(),
      navigate
    )
  }

  if (isLoading) {
    return <Spin className="spin" />
  }

  if (isError) {
    return <Navigate to={routePaths.error} />
  }

  return (
    <section className="app-access-page">
      <Column
        title="Приложения"
        searchPlaceholder="Введите имя или id"
        showUpdateBtn={false}
        showAddBtn={false}
        showRemoveBtn={false}
        items={filterFirstColumnItems(
          appList as ColumnItem<SystemTreeAppType>,
          searchValue
        )}
        renderItems={(item) => <ListItem item={item} />}
        searchValue={searchValue}
        selectedItemId={selectedItemId}
        setSelectedItemId={onSelectedItemId}
        onChangeSearchValue={handleOnChangeSearchValue}
      />
      <div className="app-access-page__content-wrap">
        {selectedItemId ? (
          <AppAccessContent
            paramPrefix={findMethodParam}
            key={`content-${selectedItemId}`}
            id={Number(selectedItemId)}
          />
        ) : (
          <EmptyData />
        )}
      </div>
    </section>
  )
}

export default memo(AppAccessPage)
