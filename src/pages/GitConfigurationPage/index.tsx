import { QuestionCircleOutlined } from '@ant-design/icons'
import { Button, message, Spin, Select, Tooltip } from 'antd'
import { FormAutoComplete, FormSelect } from 'isp-ui-kit'
import { lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react'
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

import {
  CredentialsType,
  MergeRequestType,
  UpdateCredentialsType
} from '@type/gitConfiguration.type'
import { PermissionKeysType } from '@type/roles.type'

import './git-configuration-page.scss'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

const GitConfigurationPage = () => {
  const { changeTheme } = useContext(Context)
  const dispatch = useAppDispatch()
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()
  const isPageAvailable = hasPermission(PermissionKeysType.config_edit)

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
    if (isFileLoading) {
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
    createCredentials(data)
      .unwrap()
      .then(() => {
        setShowCredentialsModal({ ...showCredentialsModal, addModal: false })
        message.success('GIT успешно создан')
      })
      .catch((e) => handleApiError(e, 'Не удалось создать GIT'))
  }

  const handleUpdateCredentials = (data: CredentialsType) => {
    if (!currentCredential) {
      return
    }

    const updateData: UpdateCredentialsType = {
      name: currentCredential.name,
      insertStruct: {
        name: data.name,
        dirPath: data.dirPath,
        repositoryUrl: data.repositoryUrl,
        ...(data.token ? { token: data.token } : {})
      }
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
    if (!currentCredential) {
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
      <div className="git-configuration-page__wrap">
        <div className="git-configuration-page__wrap__selects">
          <div className="git-configuration-page__wrap__select-field">
            <span className="git-configuration-page__wrap__select-label">
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
              style={{ width: 260 }}
            />
          </div>
          <Button
            onClick={() =>
              setShowCredentialsModal({
                ...showCredentialsModal,
                addModal: true
              })
            }
          >
            Добавить GIT
          </Button>
          <Button
            type="primary"
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
          <Button
            danger
            disabled={!currentCredential}
            onClick={handleDeleteCredentials}
            loading={isDeleteCredentialsLoading}
          >
            Удалить GIT
          </Button>
        </div>

        {currentCredential && (
          <div className="git-configuration-page__wrap__info">
            <div className="git-configuration-page__wrap__info-row">
              <span>Название:</span>
              <b>{currentCredential.name}</b>
            </div>
            <div className="git-configuration-page__wrap__info-row">
              <span>URL репозитория:</span>
              <b>{currentCredential.repositoryUrl}</b>
            </div>
            <div className="git-configuration-page__wrap__info-row">
              <span>Путь до папки:</span>
              <b>{currentCredential.dirPath}</b>
            </div>
          </div>
        )}

        <form
          className="git-configuration-page__wrap__file-form"
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

        <div className="git-configuration-page__wrap__actions">
          <Button
            onClick={handleDisplayFile}
            disabled={!fileName || isMergeLoading}
            loading={isFileLoading}
          >
            Отобразить
          </Button>
          <Button
            type="primary"
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

        <div className="git-configuration-page__wrap__file">
          <Suspense fallback={<Spin />}>
            <MonacoEditor
              value={fileContent}
              language="json"
              theme={changeTheme ? 'vs-dark' : 'vs-white'}
              height="400px"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                readOnly: true
              }}
            />
          </Suspense>
        </div>

        <GitConfigurationModal
          title="Добавить GIT"
          open={showCredentialsModal.addModal}
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
          open={showCredentialsModal.updateModal}
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
