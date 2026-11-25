import { Alert, Pagination, Spin, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { dateFormats } from '@constants/date'

import { getColumnSearchProps } from '@components/ColumnSearch'
import { highlightSearchMatch } from '@components/ColumnSearch/highlightSearchMatch'
import DownloadCsvButton from '@components/DownloadCsvButton'

import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'
import { useTableSearch } from '@hooks/useTableSearch'

import securityLogServiceApi from '@services/securityLogService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { LogType } from '@type/log.type'
import { PermissionKeysType } from '@type/roles.type'

import './security-log-page.scss'

const limit = 10

const SecurityLogPage = () => {
  const {
    query,
    searchParams,
    currentPage,
    setCurrentPage,
    handleTableChange
  } = useTableSearch<LogType>(['createdAt'], ['userId'])
  const { currentData, data, isFetching, isError } =
    securityLogServiceApi.useSearchLogsQuery(
      {
        limit,
        offset: (currentPage - 1) * limit,
        ...searchParams
      },
      { refetchOnMountOrArgChange: true }
    )

  const { data: allUsers = [], isLoading: isUsersLoading } =
    userServiceApi.useGetAllUsersQuery()
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()

  const isLoading = isUsersLoading
  const isPageAvailable = hasPermission(PermissionKeysType.security_log_view)

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.home)
    }
  }, [isPageAvailable])

  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  if (isLoading) {
    return <Spin />
  }

  const columns: ColumnsType<LogType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      ...getColumnSearchProps({
        title: 'Пользователь',
        type: 'select',
        options: allUsers.map((user) => ({
          value: user.id,
          label: getUserFullName(user)
        }))
      }),
      render: (value) => {
        const user = allUsers.find((el) => el.id === value)
        if (user) {
          return getUserFullName(user)
        }
      }
    },
    {
      title: 'Время события',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      ...getColumnSearchProps({
        title: 'Время события',
        type: 'date',
        showTime: true
      }),
      render: (value) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      title: 'Действие',
      dataIndex: 'message',
      key: 'message',
      sorter: true,
      ...getColumnSearchProps({ title: 'Действие' }),
      render: (value: string) =>
        value
          .split('\n')
          .map((line, index) => (
            <p key={index}>{highlightSearchMatch(line, query?.message)}</p>
          ))
    }
  ]

  const totalCount = (currentData ?? data)?.totalCount ?? 0

  return (
    <section className="security-log-page">
      <header className="security-log-page__header">
        <span
          data-cy="security-log-page__header__title"
          className="security-log-page__header__title"
        >
          Журнал событий
        </span>
        {isPageAvailable && (
          <DownloadCsvButton
            type="log"
            params={searchParams}
            disabled={isFetching || isError || !currentData?.items.length}
          />
        )}
      </header>
      <section className="security-log-page__content">
        {isError && (
          <Alert type="error" title="Не удалось загрузить журнал событий" />
        )}
        <div className="security-log-page__content__wrap-table">
          <Table
            rowKey={(record) => record.id}
            pagination={false}
            dataSource={currentData?.items ?? []}
            loading={isFetching}
            onChange={handleTableChange}
            columns={columns}
          />
        </div>
        <div className="security-log-page__content__pagination">
          <Pagination
            showSizeChanger={false}
            current={currentPage}
            total={totalCount}
            pageSize={limit}
            onChange={setCurrentPage}
            disabled={isFetching}
          />
        </div>
      </section>
    </section>
  )
}

export default SecurityLogPage
