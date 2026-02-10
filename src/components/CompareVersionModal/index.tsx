import { Button, Spin, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { FC, lazy, memo, Suspense, useContext, useState } from 'react'

import { dateFormats } from '@constants/date'

import Modal from '@widgets/Modal'

import { CompareVersionModalPropsType } from '@components/CompareVersionModal/compare-version-modal.type'

import { sortObject } from '@utils/objectUtils'

import { useAppSelector } from '@hooks/redux'

import configServiceApi from '@services/configService'
import userServiceApi from '@services/userService'

import { Context } from '@stores/index'

import { VersionType } from '@type/version.type'

import './compare-version-modal.scss'

const DiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor }))
)

const CompareVersionModal: FC<CompareVersionModalPropsType> = ({
  open,
  onClose,
  config,
  currentConfigId
}) => {
  const [selectedItem, setSelectedItem] = useState<VersionType>()
  const { data: versions = [], isLoading: isVersionLoading } =
    configServiceApi.useGetAllVersionQuery(currentConfigId)
  const { data: allUsers = [], isLoading: isUsersLoading } =
    userServiceApi.useGetAllUsersQuery()
  const { profile } = useAppSelector((state) => state.profileReducer)
  const { changeTheme } = useContext(Context)
  const isLoading = isVersionLoading || isUsersLoading
  if (isLoading) {
    return <Spin />
  }

  const columns: ColumnsType<VersionType> = [
    {
      key: 'configVersion',
      title: 'Версия',
      dataIndex: 'configVersion',
      render: (value: string, _, index) => {
        if (index === 0) {
          return (
            <div className="compare-version-modal__content__table__current-version-cell">
              <span>{value}</span>
              <Tag color="blue">Текущая версия</Tag>
            </div>
          )
        }
        return value
      }
    },
    {
      key: 'createdAt',
      title: 'Создано',
      dataIndex: 'createdAt',
      render: (value: string) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      key: 'user',
      title: 'Автор',
      dataIndex: 'adminId',
      render: (value: number) => {
        const user = allUsers.find((user) => user.id === value)
        if (user) {
          return `${user.lastName} ${user.firstName}`
        }
        return `${profile.lastName} ${profile.firstName}`
      }
    }
  ]
  return (
    <div className="compare-version-modal">
      <Modal
        title="Выберите версию для сравнения"
        open={open}
        onClose={onClose}
      >
        {selectedItem ? (
          <div className="compare-version-modal__content">
            <Button onClick={() => setSelectedItem(undefined)}>Назад</Button>
            <div className="compare-version-modal__header">
              <span> Версия: {selectedItem.configVersion}</span>
              <span>
                {config?.version
                  ? `Текущая версия : ${config?.version}`
                  : `Версия: ${config?.configVersion}`}
              </span>
            </div>
            <Suspense fallback={<Spin />}>
              <DiffEditor
                original={JSON.stringify(
                  sortObject(selectedItem.data),
                  null,
                  2
                )}
                modified={JSON.stringify(sortObject(config?.data), null, 2)}
                theme={changeTheme ? 'vs-dark' : 'vs-white'}
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  renderOverviewRuler: false,
                  autoClosingOvertype: 'auto'
                }}
              />
            </Suspense>
          </div>
        ) : (
          <div className="compare-version-modal__content__table">
            <Table
              size="small"
              columns={columns}
              pagination={{ pageSize: 30 }}
              dataSource={versions}
              rowKey={(record) => record.id}
              onRow={(record, i) => {
                if (i === 0) {
                  return {}
                }
                return {
                  onClick: () => setSelectedItem(record)
                }
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default memo(CompareVersionModal)
