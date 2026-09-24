import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOutlined,
  LinkOutlined,
  PlusOutlined,
  ProfileOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  message,
  Popconfirm,
  Select,
  Spin,
  Tag,
  Tooltip
} from 'antd'
import { FormAutoComplete, FormSelect } from 'isp-ui-kit'
import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'

import { ValidationRules } from '@constants/form/validationRules'

import GitConfigurationModal from '@components/GitConfigurationModal'

import {
  GitFileFormType,
  OptionType
} from '@pages/GitConfigurationPage/git-configuration-page.type'

import { handleApiError } from '@utils/errorUtils'

import { useAppDispatch } from '@hooks/redux'
import useRole from '@hooks/useRole'

import configServiceApi from '@services/configService'
import gitConfigurationApi from '@services/gitConfigurationService'
import modulesServiceApi from '@services/modulesService'

import { Context } from '@stores/index'

import { routePaths } from '@routes/routePaths'

import { CredentialsType, MergeRequestType } from '@type/gitConfiguration.type'
import { PermissionKeysType } from '@type/roles.type'

import './git-configuration-page.scss'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

const GitConfigurationPage = () => {
  const { changeTheme } = useContext(Context)
  const dispatch = useAppDispatch()
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()
  const isPageAvailable =
    hasPermission(PermissionKeysType.git_configuration_view) &&
    hasPermission(PermissionKeysType.module_view)
  const canEditCredentials = hasPermission(
    PermissionKeysType.git_configuration_credentials_edit
  )
  const canMergeConfiguration = hasPermission(
    PermissionKeysType.git_configuration_merge
  )

  const { control, watch, reset, setValue, handleSubmit } =
    useForm<GitFileFormType>()
  const {
    fileName,
    module: moduleName,
    hash: selectedHash,
    tag: selectedTag
  } = watch()

  const [selectedCredentialName, setSelectedCredentialName] = useState<
    string | undefined
  >(undefined)
  const [fileContent, setFileContent] = useState('')
  const [filesOptions, setFilesOptions] = useState<OptionType[]>([])
  const [hashOptions, setHashOptions] = useState<OptionType[]>([])
  const [tagOptions, setTagOptions] = useState<OptionType[]>([])

  const editorBoxRef = useRef<HTMLDivElement | null>(null)
  const [editorHeight, setEditorHeight] = useState(400)

  const {
    data: credentials = [],
    isLoading: isCredentialsLoading,
    isError: isCredentialsError
  } = gitConfigurationApi.useCredentialsQuery()

  const [createCredentials, { isLoading: isCreateCredentialsLoading }] =
    gitConfigurationApi.useCreateCredentialsMutation()
  const [updateCredentials, { isLoading: isUpdateCredentialsLoading }] =
    gitConfigurationApi.useUpdateCredentialsMutation()
  const [deleteCredentials, { isLoading: isDeleteCredentialsLoading }] =
    gitConfigurationApi.useDeleteCredentialsMutation()

  const isCredentialsMutationLoading =
    isCreateCredentialsLoading ||
    isUpdateCredentialsLoading ||
    isDeleteCredentialsLoading
  const [gitDir, { isLoading: isDirLoading }] =
    gitConfigurationApi.useGitDirMutation()
  const [gitCommits] = gitConfigurationApi.useGitCommitsMutation()
  const [gitFile, { isLoading: isFileLoading }] =
    gitConfigurationApi.useGitFileMutation()
  const [configMerge, { isLoading: isMergeLoading }] =
    gitConfigurationApi.useConfigMergeMutation()
  const {
    data: modulesList = [],
    isLoading: isModulesLoading,
    isError: isModulesError
  } = modulesServiceApi.useGetModulesQuery('modules')

  const isError = isCredentialsError || isModulesError

  const [showCredentialsModal, setShowCredentialsModal] = useState({
    addModal: false,
    updateModal: false
  })

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

  const currentCredential = useMemo(
    () => credentials.find((item) => item.name === selectedCredentialName),
    [credentials, selectedCredentialName]
  )

  const credentialsOptions = credentials.map((item) => ({
    label: item.name,
    value: item.name
  }))

  const modulesOptions = modulesList.map((item) => ({
    label: item.name,
    value: item.name
  }))

  const resetGitData = () => {
    reset()
    setFileContent('')
    setFilesOptions([])
    setHashOptions([])
    setTagOptions([])
  }

  const loadDirFiles = async (credentialName: string) => {
    try {
      const files = await gitDir({ credentialsName: credentialName }).unwrap()
      setFilesOptions(files.map((file) => ({ label: file, value: file })))
    } catch (e) {
      handleApiError(e, 'Не удалось получить список файлов')
    }
  }

  const handleSelectCredential = (credentialName: string) => {
    setSelectedCredentialName(credentialName)
    resetGitData()
    void loadDirFiles(credentialName)
  }

  useEffect(() => {
    setValue('hash', null)
    setValue('tag', null)
    setHashOptions([])
    setTagOptions([])
    setFileContent('')

    if (!selectedCredentialName || !fileName) {
      return
    }

    let active = true

    gitCommits({ credentialsName: selectedCredentialName })
      .unwrap()
      .then((commits) => {
        if (!active) {
          return
        }
        setHashOptions(
          commits.map((commit) => ({ label: commit.hash, value: commit.hash }))
        )
        setTagOptions(
          [...new Set(commits.flatMap((commit) => commit.tags))]
            .filter(Boolean)
            .map((tag) => ({ label: tag, value: tag }))
        )
      })
      .catch((e) => handleApiError(e, 'Не удалось получить историю коммитов'))

    return () => {
      active = false
    }
  }, [fileName, selectedCredentialName])

  useEffect(() => {
    setFileContent('')
  }, [selectedHash, selectedTag])

  useEffect(() => {
    if (selectedHash && selectedTag) {
      setValue('tag', null)
    }
  }, [selectedHash])

  useEffect(() => {
    if (selectedHash && selectedTag) {
      setValue('hash', null)
    }
  }, [selectedTag])

  useEffect(() => {
    const element = editorBoxRef.current
    if (!element) {
      return
    }

    const updateEditorHeight = () => {
      const height = Math.floor(element.clientHeight)
      if (height > 0) {
        setEditorHeight(height)
      }
    }

    updateEditorHeight()

    const resizeObserver = new ResizeObserver(updateEditorHeight)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [fileContent])

  const handleDisplayFile = async () => {
    if (!selectedCredentialName || !fileName) {
      return
    }

    try {
      const result = await gitFile({
        credentialsName: selectedCredentialName,
        filePath: fileName,
        ...(selectedHash ? { hash: selectedHash } : {}),
        ...(selectedTag ? { tag: selectedTag } : {})
      }).unwrap()
      setFileContent(JSON.stringify(result, null, 2))
    } catch (e) {
      handleApiError(e, 'Не удалось получить файл')
    }
  }

  const handleApplyFile = async (formData?: GitFileFormType) => {
    if (!canMergeConfiguration || isFileLoading) {
      return
    }

    const module = (formData?.module ?? moduleName ?? '').trim()
    if (!module) {
      return
    }

    let config: unknown
    try {
      config = JSON.parse(fileContent)
    } catch {
      message.error('Не удалось разобрать содержимое файла')
      return
    }

    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      message.error('Содержимое файла должно быть JSON-объектом')
      return
    }

    const request: MergeRequestType = {
      config: config as Record<string, unknown>,
      module
    }

    configMerge(request)
      .unwrap()
      .then(() => {
        message.success('Конфигурация успешно применена')
        dispatch(
          configServiceApi.util.invalidateTags([
            'configs',
            'config',
            'versions'
          ])
        )
      })
      .catch((e) => handleApiError(e, 'Не удалось применить конфигурацию'))
  }

  const handleCreateCredentials = (data: CredentialsType) => {
    if (!canEditCredentials) {
      return
    }

    createCredentials(data)
      .unwrap()
      .then(() => {
        setShowCredentialsModal({ ...showCredentialsModal, addModal: false })
        message.success('GIT успешно создан')
      })
      .catch((e) => handleApiError(e, 'Не удалось создать GIT'))
  }

  const handleUpdateCredentials = (data: CredentialsType) => {
    if (!canEditCredentials || !currentCredential) {
      return
    }

    const updateData: CredentialsType = {
      name: data.name,
      dirPath: data.dirPath,
      repositoryUrl: data.repositoryUrl,
      token: data.token
    }

    updateCredentials(updateData)
      .unwrap()
      .then(() => {
        setShowCredentialsModal({ ...showCredentialsModal, updateModal: false })
        handleSelectCredential(data.name)
        message.success('GIT успешно отредактирован')
      })
      .catch((e) => handleApiError(e, 'Не удалось отредактировать GIT'))
  }

  const handleDeleteCredentials = () => {
    if (!canEditCredentials || !currentCredential) {
      return
    }

    deleteCredentials({ name: currentCredential.name })
      .unwrap()
      .then(() => {
        setSelectedCredentialName(undefined)
        resetGitData()
        message.success('GIT удален')
      })
      .catch((e) => handleApiError(e, 'Не удалось удалить GIT'))
  }

  if (isError) {
    return <Navigate to={routePaths.error} />
  }

  return (
    <section className="git-configuration-page">
      <div className="git-configuration-page__header">
        <h1 className="git-configuration-page__header-title">
          Git конфигурация
        </h1>
        <p className="git-configuration-page__description">
          Выберите источник конфигурации, откройте файл и проверьте его перед
          применением к модулю.
        </p>
      </div>
      <div className="git-configuration-page__wrap">
        <Card
          className="git-configuration-page__card"
          title={
            <span className="git-configuration-page__card-title">
              <span
                className="git-configuration-page__step-number"
                aria-label="Шаг 1"
              >
                1
              </span>
              Выберите соединение GIT
            </span>
          }
          extra={
            canEditCredentials && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  setShowCredentialsModal({
                    ...showCredentialsModal,
                    addModal: true
                  })
                }
              >
                Добавить GIT
              </Button>
            )
          }
        >
          <p className="git-configuration-page__hint">
            Выберите существующее соединение или добавьте новое.
          </p>
          <div className="git-configuration-page__selects">
            <div className="git-configuration-page__select-field">
              <span className="git-configuration-page__select-label">
                Зона ответственности
              </span>
              <Select
                placeholder="Выберите GIT"
                value={selectedCredentialName}
                onChange={handleSelectCredential}
                options={credentialsOptions}
                loading={isCredentialsLoading}
                disabled={
                  isDirLoading ||
                  isFileLoading ||
                  isMergeLoading ||
                  isCredentialsMutationLoading
                }
                style={{ width: '100%' }}
              />
            </div>
            {canEditCredentials && (
              <div className="git-configuration-page__select-actions">
                <Button
                  icon={<EditOutlined />}
                  disabled={!currentCredential}
                  onClick={() =>
                    setShowCredentialsModal({
                      ...showCredentialsModal,
                      updateModal: true
                    })
                  }
                >
                  Редактировать GIT
                </Button>
                <Popconfirm
                  okText="Удалить"
                  title="Вы действительно хотите удалить этот GIT?"
                  onConfirm={handleDeleteCredentials}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={!currentCredential}
                    loading={isDeleteCredentialsLoading}
                  >
                    Удалить GIT
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>

          {currentCredential && (
            <div className="git-configuration-page__info">
              <div className="git-configuration-page__info-item">
                <ProfileOutlined className="git-configuration-page__info-icon" />
                <div className="git-configuration-page__info-content">
                  <span className="git-configuration-page__info-label">
                    Название
                  </span>
                  <b className="git-configuration-page__info-value">
                    {currentCredential.name}
                  </b>
                </div>
              </div>
              <div className="git-configuration-page__info-item">
                <LinkOutlined className="git-configuration-page__info-icon" />
                <div className="git-configuration-page__info-content">
                  <span className="git-configuration-page__info-label">
                    URL репозитория
                  </span>
                  <b className="git-configuration-page__info-value git-configuration-page__info-value--code">
                    {currentCredential.repositoryUrl}
                  </b>
                </div>
              </div>
              <div className="git-configuration-page__info-item">
                <FolderOutlined className="git-configuration-page__info-icon" />
                <div className="git-configuration-page__info-content">
                  <span className="git-configuration-page__info-label">
                    Путь до папки
                  </span>
                  <b className="git-configuration-page__info-value git-configuration-page__info-value--code">
                    {currentCredential.dirPath}
                  </b>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card
          className="git-configuration-page__card"
          title={
            <span className="git-configuration-page__card-title">
              <span
                className="git-configuration-page__step-number"
                aria-label="Шаг 2"
              >
                2
              </span>
              Выберите файл и модуль
            </span>
          }
        >
          <p className="git-configuration-page__hint">
            Укажите файл и целевой модуль. Для выбора версии можно задать хэш
            или тэг, затем нажмите «Отобразить».
          </p>
          <form
            className="git-configuration-page__file-form"
            onSubmit={handleSubmit(handleApplyFile)}
          >
            <FormSelect
              control={control}
              name="fileName"
              label="Файл с конфигурацией"
              placeholder="Выберите файл"
              options={filesOptions}
              disabled={
                !selectedCredentialName ||
                isDirLoading ||
                isFileLoading ||
                isMergeLoading ||
                isCredentialsMutationLoading
              }
              loading={isDirLoading}
              showSearch
              rules={{ required: ValidationRules.required }}
            />
            <FormSelect
              control={control}
              name="module"
              label="Модуль"
              placeholder="Выберите модуль"
              options={modulesOptions}
              disabled={
                !fileName || isMergeLoading || isCredentialsMutationLoading
              }
              loading={isModulesLoading}
              showSearch
              allowClear
              rules={{ required: ValidationRules.required }}
            />
            <FormAutoComplete
              control={control}
              name="hash"
              label={
                <>
                  Хэш{' '}
                  <Tooltip title="При выборе хэша тэг будет очищен">
                    <QuestionCircleOutlined className="git-configuration-page__help-icon" />
                  </Tooltip>
                </>
              }
              placeholder="Выберите или введите хэш"
              options={hashOptions}
              disabled={
                !fileName ||
                isFileLoading ||
                isMergeLoading ||
                isCredentialsMutationLoading
              }
              allowClear
            />
            <FormAutoComplete
              control={control}
              name="tag"
              label={
                <>
                  Тэг{' '}
                  <Tooltip title="При выборе тега хэш будет очищен">
                    <QuestionCircleOutlined className="git-configuration-page__help-icon" />
                  </Tooltip>
                </>
              }
              placeholder="Выберите или введите тэг"
              options={tagOptions}
              disabled={
                !fileName ||
                isFileLoading ||
                isMergeLoading ||
                isCredentialsMutationLoading
              }
              allowClear
            />
          </form>

          <div className="git-configuration-page__actions">
            <Button
              icon={<EyeOutlined />}
              onClick={handleDisplayFile}
              disabled={!fileName || isMergeLoading}
              loading={isFileLoading}
            >
              Отобразить
            </Button>
          </div>
        </Card>

        <Card
          className="git-configuration-page__card git-configuration-page__card--editor"
          title={
            <span className="git-configuration-page__card-title">
              <span
                className="git-configuration-page__step-number"
                aria-label="Шаг 3"
              >
                3
              </span>
              Проверьте и примените
            </span>
          }
          extra={
            fileName ? (
              <Tag className="git-configuration-page__file-tag">{fileName}</Tag>
            ) : null
          }
        >
          <p className="git-configuration-page__hint">
            Проверьте содержимое файла перед применением конфигурации к
            выбранному модулю.
          </p>
          {fileContent ? (
            <div ref={editorBoxRef} className="git-configuration-page__file">
              <Suspense fallback={<Spin />}>
                <MonacoEditor
                  value={fileContent}
                  language="json"
                  theme={changeTheme ? 'vs-dark' : 'vs-white'}
                  height={editorHeight}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: true
                  }}
                />
              </Suspense>
            </div>
          ) : (
            <Empty
              className="git-configuration-page__empty"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Выберите файл и нажмите «Отобразить», чтобы увидеть содержимое"
            />
          )}
          {canMergeConfiguration && (
            <div className="git-configuration-page__actions">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  void handleSubmit(handleApplyFile)()
                }}
                disabled={
                  !fileContent ||
                  !selectedCredentialName ||
                  !moduleName?.trim() ||
                  isFileLoading
                }
                loading={isMergeLoading}
              >
                Применить
              </Button>
            </div>
          )}
        </Card>

        <GitConfigurationModal
          title="Добавить GIT"
          open={canEditCredentials && showCredentialsModal.addModal}
          onOk={handleCreateCredentials}
          loading={isCreateCredentialsLoading}
          onClose={() =>
            setShowCredentialsModal({
              ...showCredentialsModal,
              addModal: false
            })
          }
        />
        <GitConfigurationModal
          title="Редактировать GIT"
          credentials={currentCredential}
          open={canEditCredentials && showCredentialsModal.updateModal}
          onOk={handleUpdateCredentials}
          loading={isUpdateCredentialsLoading}
          onClose={() =>
            setShowCredentialsModal({
              ...showCredentialsModal,
              updateModal: false
            })
          }
        />
      </div>
    </section>
  )
}

export default GitConfigurationPage
