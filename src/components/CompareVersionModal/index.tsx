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

  const originalValue = useMemo(() => {
    if (!selectedItem?.data) return ''
    return JSON.stringify(sortObject(selectedItem.data), null, 2)
  }, [selectedItem])

  const modifiedValue = useMemo(() => {
    if (!config?.data) return ''
    return JSON.stringify(sortObject(config.data), null, 2)
  }, [config])

  const handleDiffMount = (editor: any) => {
    const revealFirstDiff = () => {
      const changes = editor?.getLineChanges?.()
      if (!changes?.length) return

      const first = changes[0]
      const line =
        first?.modifiedStartLineNumber ?? first?.originalStartLineNumber ?? 1

      const modifiedEditor = editor?.getModifiedEditor?.()
      modifiedEditor?.revealLineInCenter(line)
      modifiedEditor?.setPosition({ lineNumber: line, column: 1 })
    }

    const disposable = editor?.onDidUpdateDiff?.(() => {
      revealFirstDiff()
      disposable?.dispose?.()
    })

    revealFirstDiff()
  }

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
        if (config.configVersion === value) {
          return (
            <div className="compare-version-modal__content__table__current-version-cell">
              <span>{value}</span>
              <Tag color="green">Выбрана для сравнения</Tag>
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

  const modalTitle = !selectedItem
    ? 'Выберите версию для сравнения'
    : 'Сравнение версий'

  return (
    <div className="compare-version-modal">
      <Modal title={modalTitle} open={open} onClose={onClose}>
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
                onMount={handleDiffMount}
                language="json"
                original={originalValue}
                modified={modifiedValue}
                theme={changeTheme ? 'vs-dark' : 'light'}
                options={{
                  readOnly: true,
                  domReadOnly: true,

                  wordWrap: 'on',
                  scrollBeyondLastLine: false,

                  renderSideBySide: true,
                  ignoreTrimWhitespace: true,
                  diffAlgorithm: 'advanced',

                  renderIndicators: true,
                  renderOverviewRuler: true,

                  minimap: { enabled: false },

                  hideUnchangedRegions: {
                    enabled: true,
                    contextLineCount: 4,
                    minimumLineCount: 3
                  },

                  maxComputationTime: 5000
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
              rowClassName="compare-version-modal__content__table__row"
              rowKey={(record) => record.id}
              onRow={(record) => {
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
