import { Pagination, Spin, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { dateFormats } from '@constants/date.ts'

import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'

import securityLogServiceApi from '@services/securityLogService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths.ts'

import { LogType } from '@type/log.type'
import { PermissionKeysType } from '@type/roles.type'

import './security-log-page.scss'

const limit = 10

const SecurityLogPage = () => {
  const [getAllLogs, { data, isLoading: isLoadingLogs }] =
    securityLogServiceApi.useGetAllLogsMutation()

  const { data: allUsers = [], isLoading: isUsersLoading } =
    userServiceApi.useGetAllUsersQuery()
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)

  const isLoading = isUsersLoading || isLoadingLogs
  const isPageAvailable = hasPermission(PermissionKeysType.security_log_view)

  useEffect(() => {
    getAllLogs({ limit, offset: 0 })
  }, [])

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

  const handleChangePagination = (page: number) => {
    setCurrentPage(page)
    getAllLogs({ limit, offset: (page - 1) * limit })
  }

  if (isLoading || !data) {
    return <Spin />
  }

  const columns: ColumnsType<LogType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      key: 'userId',
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
      render: (value) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      title: 'Действие',
      dataIndex: 'message',
      key: 'message',
      render: (value: string) =>
        value.split('\n').map((line) => <p key={line}>{line}</p>)
    }
  ]

  const { totalCount, items } = data

  return (
    <section className="security-log-page">
      <header className="security-log-page__header">
        <span
          data-cy="security-log-page__header__title"
          className="security-log-page__header__title"
        >
          Просмотр журналов ИБ
        </span>
      </header>
      <section className="security-log-page__content">
        <div className="security-log-page__content__wrap-table">
          <Table
            rowKey={(record) => record.id}
            pagination={false}
            dataSource={items}
            columns={columns}
          />
        </div>
        <div className="security-log-page__content__pagination">
          <Pagination
            showSizeChanger={false}
            current={currentPage}
            total={totalCount}
            pageSize={limit}
            onChange={handleChangePagination}
          />
        </div>
      </section>
    </section>
  )
}

export default SecurityLogPage
