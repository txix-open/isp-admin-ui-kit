import {
  DownOutlined,
  DiffOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Dropdown,
  MenuProps,
  message,
  Popover,
  Segmented,
  Space
} from 'antd'
import { AxiosError } from 'axios'
import { FC, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import ConfigSchemaModal from '@components/ConfigSchemaModal'
import ConfigurationEditorCode from '@components/ConfigurationEditorCode'
import ConfigurationEditorForm from '@components/ConfigurationEditorForm'
import ConfigurationEditorJson from '@components/ConfigurationEditorJson'
import ConfirmConfigModal from '@components/ConfirmConfigModal/ConfirmConfigModal'
import ErrorConfigModal from '@components/ErrorConfigModal/ErrorConfigModal'
import JsonDiffModal from '@components/JsonDiffModal'
import {
  PageAccessDenied,
  PageBackButton,
  PageHeader,
  PageLoading
} from '@components/PageLayout'

import { ConfigType } from '@pages/ModulesPage/module.type'

import { ignoreApiError, notifyApiError } from '@utils/apiErrorNotifications'
import { equalConfigurationData } from '@utils/configurationDraft'
import { cleanEmptyParamsObject } from '@utils/objectUtils'

import useRole from '@hooks/useRole'
import useUnsavedChanges from '@hooks/useUnsavedChanges'

import configServiceApi from '@services/configService'
import modulesServiceApi from '@services/modulesService'

import { routePaths } from '@routes/routePaths'

import { MSPError } from '@type/index'
import { PermissionKeysType } from '@type/roles.type'

import './configuration-editor-page.scss'

const ConfigurationEditor: FC = () => {
  const { hasPermission } = useRole()
  const navigate = useNavigate()
  const { moduleId = '', id = '' } = useParams()
  const { state, search } = useLocation()
  const isNew = id === 'new'
  const isUnsafeButton = hasPermission(
    PermissionKeysType.module_configuration_save_unsafe
  )
  const {
    currentData: jsonSchema,
    isLoading: isLoadingJsonSchema,
    isError: isSchemaError,
    refetch: refetchSchema
  } = modulesServiceApi.useGetByModuleIdQuery(moduleId)
  const {
    currentData: currentConfig,
    isLoading: isCurrentConfigLoading,
    isError: isConfigError,
    refetch: refetchConfig
  } = configServiceApi.useGetConfigByIdQuery(id, {
    skip: isNew
  })
  const [createUpdateConfig, { isLoading: isSaving }] =
    configServiceApi.useCreateUpdateConfigMutation()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSchemeModal, setShowSchemeModal] = useState(false)
  const [showChanges, setShowChanges] = useState(false)
  const [previewCleaned, setPreviewCleaned] = useState(false)
  const [conflictRevision, setConflictRevision] = useState(0)
  const [editorMode, setEditorMode] = useState<'form' | 'json' | 'code'>('json')
  const [bufConfig, setBufConfig] = useState<ConfigType>()
  const [baseline, setBaseline] = useState<ConfigType>()
  const [editorRevision, setEditorRevision] = useState(0)
  const [detailsErrors, setDetailsError] = useState({
    details: {},
    isOpenDetailsErrorModal: false
  })
  const [disableBtn, setDisableBtn] = useState(false)
  const savingRef = useRef(false)
  const saveOptions = useRef({ unsafe: false, isGoBack: false })
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || (!isNew && !currentConfig)) return
    const initial = isNew
      ? ({
          id: '',
          moduleId,
          name: state?.name || '',
          version: 0,
          data: {},
          active: false,
          commonConfigs: [],
          createdAt: '',
          updatedAt: '',
          description: '',
          valid: false
        } as ConfigType)
      : currentConfig!
    setBufConfig(initial)
    setBaseline(initial)
    initialized.current = true
  }, [isNew, currentConfig, moduleId, state?.name])

  const hasChanges = Boolean(
    bufConfig &&
    baseline &&
    !equalConfigurationData(bufConfig.data, baseline.data)
  )
  const hasUnsavedChanges = hasChanges || disableBtn
  const draftGuard = useUnsavedChanges({
    dirty: hasUnsavedChanges,
    busy: isSaving,
    label: `Конфигурация «${bufConfig?.name || 'Новая конфигурация'}»`
  })

  const saveDisabled =
    !bufConfig ||
    disableBtn ||
    isSaving ||
    (!isNew && !hasChanges) ||
    (isNew && !bufConfig.name)
  const goToConfigurationPage = () =>
    navigate(
      {
        pathname: `${routePaths.modules}/${moduleId}/${routePaths.configurations}`,
        search
      },
      { state: { moduleScrollTop: state?.moduleScrollTop ?? 0 } }
    )

  const handleSaveClick = async (
    upVersion?: number,
    unsafe = false,
    isGoBack = false
  ) => {
    if (
      savingRef.current ||
      saveDisabled ||
      !bufConfig ||
      (unsafe && !isUnsafeButton)
    )
      return
    savingRef.current = true
    saveOptions.current = { unsafe, isGoBack }
    const payload = {
      ...bufConfig,
      version: upVersion ?? baseline?.version ?? 0,
      unsafe
    }
    try {
      const saved = await createUpdateConfig(
        cleanEmptyParamsObject(payload)
      ).unwrap()
      setBufConfig(saved)
      setBaseline(saved)
      setEditorRevision((value) => value + 1)
      setShowConfirmModal(false)
      if (isGoBack) {
        draftGuard.markSaved()
        goToConfigurationPage()
      } else if (isNew) {
        draftGuard.markSaved()
        navigate(
          {
            pathname: `/${moduleId}/${routePaths.configEditor}/${saved.id}`,
            search
          },
          {
            replace: true,
            state: { moduleScrollTop: state?.moduleScrollTop ?? 0 }
          }
        )
      }
      message.success('Конфигурация успешно сохранена')
    } catch (error) {
      const e = error as AxiosError<MSPError>
      const data = e.response?.data
      const errorCode = Number(data?.errorCode)
      if (errorCode === 2004) {
        ignoreApiError(e)
        setConflictRevision((value) => value + 1)
        setShowConfirmModal(true)
      } else if (errorCode === 2003) {
        ignoreApiError(e)
        setDetailsError({
          details: data?.details ?? {},
          isOpenDetailsErrorModal: true
        })
      } else {
        notifyApiError(
          e,
          errorCode === 400
            ? 'Невалидный JSON объект'
            : 'Ошибка обновления конфигурации'
        )
      }
    } finally {
      savingRef.current = false
    }
  }

  const onSaveBtn: MenuProps['onClick'] = ({ key }) => {
    void handleSaveClick(undefined, key === 'unsafe', false)
  }
  const itemsSaveBtn = [
    { key: 'save', label: 'Сохранить' },
    ...(isUnsafeButton
      ? [{ key: 'unsafe', label: 'Сохранить небезопасно' }]
      : [])
  ]
  const editorProps = {
    bufConfig: bufConfig!,
    setBufConfig,
    jsonSchema,
    isCurrentConfigLoading: false,
    disabled: isSaving
  }
  const isLoading =
    isLoadingJsonSchema ||
    isCurrentConfigLoading ||
    (!bufConfig && !isConfigError)

  return (
    <main className="configuration-editor-page">
      <PageHeader
        title={bufConfig?.name || state?.name || 'Конфигурация'}
        context={
          isNew ? 'Создание конфигурации' : 'Редактирование конфигурации'
        }
        description={
          <span role="status">
            {isSaving ? (
              'Сохранение…'
            ) : isLoading ? (
              'Загрузка…'
            ) : hasChanges || disableBtn ? (
              <Button
                type="link"
                className="configuration-editor-page__changes-button"
                icon={<DiffOutlined />}
                disabled={disableBtn}
                title={
                  disableBtn
                    ? 'Исправьте JSON, чтобы посмотреть изменения'
                    : 'Посмотреть изменения конфигурации'
                }
                onClick={() => {
                  setPreviewCleaned(false)
                  setShowChanges(true)
                }}
              >
                Есть изменения
              </Button>
            ) : isNew ? (
              'Новая конфигурация'
            ) : (
              'Нет изменений'
            )}
          </span>
        }
        back={
          <PageBackButton disabled={isSaving} onClick={goToConfigurationPage}>
            К конфигурациям
          </PageBackButton>
        }
        actions={
          <>
            <Button
              disabled={!jsonSchema}
              title="Текущая схема конфигурации"
              onClick={() => setShowSchemeModal(true)}
            >
              Схема
            </Button>
            <Space.Compact>
              <Button
                loading={isSaving}
                disabled={saveDisabled}
                type="primary"
                onClick={() => handleSaveClick(undefined, false, true)}
              >
                Сохранить и выйти
              </Button>
              <Dropdown
                disabled={saveDisabled}
                menu={{ items: itemsSaveBtn, onClick: onSaveBtn }}
              >
                <Button
                  type="primary"
                  disabled={saveDisabled}
                  aria-label="Другие действия сохранения"
                  icon={<DownOutlined />}
                />
              </Dropdown>
            </Space.Compact>
          </>
        }
      />
      <div className="configuration-editor-page__content">
        {(isSchemaError || isConfigError) && (
          <Alert
            type="error"
            showIcon
            title="Не удалось загрузить данные редактора"
            description={
              bufConfig
                ? 'Черновик остаётся в редакторе. Повторите загрузку недоступных данных.'
                : 'Повторите загрузку, чтобы открыть конфигурацию.'
            }
            action={
              <Button
                onClick={() => {
                  if (isSchemaError) void refetchSchema()
                  if (isConfigError && !isNew) void refetchConfig()
                }}
              >
                Повторить
              </Button>
            }
          />
        )}
        {isNew && !bufConfig?.name && !isLoading && (
          <Alert
            type="warning"
            showIcon
            title="Не задано название конфигурации"
            description="Вернитесь к списку и начните создание с указания названия."
          />
        )}
        {isLoading ? (
          <PageLoading label="Загрузка конфигурации…" />
        ) : (
          bufConfig && (
            <>
              <Segmented
                className="configuration-editor-page__mode-switch"
                aria-label="Режим редактирования"
                tabIndex={-1}
                value={editorMode}
                disabled={disableBtn || isSaving}
                onChange={setEditorMode}
                options={[
                  { label: 'Форма', value: 'form', disabled: !jsonSchema },
                  { label: 'JSON', value: 'json' },
                  { label: 'Редактор кода', value: 'code' }
                ]}
              />
              <Popover
                trigger="click"
                placement="bottomLeft"
                title="Очистка при сохранении"
                content={
                  <p className="configuration-editor-page__save-note-details">
                    Удаляются пустые строки (включая пробелы), null, пустые
                    объекты и массивы, в том числе внутри вложенных разделов.
                    Пустые элементы массивов также удаляются. Значения 0 и false
                    сохраняются. Очистка применяется и при небезопасном
                    сохранении.
                  </p>
                }
              >
                <Button
                  type="text"
                  icon={<InfoCircleOutlined />}
                  className="configuration-editor-page__save-note"
                >
                  Пустые значения удаляются при сохранении
                </Button>
              </Popover>
              <fieldset
                className={`configuration-editor-page__editor configuration-editor-page__editor--${editorMode}`}
                disabled={isSaving}
                key={editorRevision}
              >
                {editorMode === 'form' && (
                  <ConfigurationEditorForm {...editorProps} />
                )}
                {editorMode === 'json' && (
                  <ConfigurationEditorJson {...editorProps} />
                )}
                {editorMode === 'code' && (
                  <ConfigurationEditorCode
                    {...editorProps}
                    setDisableBtn={setDisableBtn}
                  />
                )}
              </fieldset>
            </>
          )
        )}
      </div>
      {showChanges && baseline && bufConfig && (
        <JsonDiffModal
          title="Изменения конфигурации"
          configName={bufConfig.name}
          original={baseline.data}
          modified={
            previewCleaned
              ? cleanEmptyParamsObject(bufConfig.data)
              : bufConfig.data
          }
          originalLabel="Слева: до изменений"
          modifiedLabel={
            previewCleaned
              ? 'Справа: после очистки перед сохранением'
              : 'Справа: текущий черновик'
          }
          toolbar={
            <>
              <Segmented
                aria-label="Данные для сравнения"
                tabIndex={-1}
                value={previewCleaned ? 'cleaned' : 'draft'}
                onChange={(value) => setPreviewCleaned(value === 'cleaned')}
                options={[
                  { label: 'Черновик', value: 'draft' },
                  { label: 'После очистки', value: 'cleaned' }
                ]}
              />
              <p>
                {previewCleaned
                  ? 'Показаны данные после удаления пустых значений — в таком виде они отправляются при сохранении.'
                  : 'Показаны все изменения черновика, включая пустые значения. Перед сохранением применяется очистка.'}
              </p>
            </>
          }
          open
          onClose={() => setShowChanges(false)}
        />
      )}
      <ConfigSchemaModal
        schema={jsonSchema?.schema}
        open={showSchemeModal}
        onClose={() => setShowSchemeModal(false)}
      />
      {showConfirmModal && (
        <ConfirmConfigModal
          key={conflictRevision}
          open
          loading={isSaving}
          onClose={() => setShowConfirmModal(false)}
          onAccept={(latest) => {
            setBufConfig(latest)
            setBaseline(latest)
            setDisableBtn(false)
            setEditorRevision((value) => value + 1)
            setShowConfirmModal(false)
          }}
          onForce={(version) =>
            handleSaveClick(
              version,
              saveOptions.current.unsafe,
              saveOptions.current.isGoBack
            )
          }
        />
      )}
      <ErrorConfigModal
        details={detailsErrors.details}
        open={detailsErrors.isOpenDetailsErrorModal}
        onClose={() =>
          setDetailsError({ details: {}, isOpenDetailsErrorModal: false })
        }
      />
    </main>
  )
}

const ConfigurationEditorPage: FC = () => {
  const { moduleId, id } = useParams()
  const { hasPermission } = useRole()
  const isNew = id === 'new'
  const canAccess = hasPermission(
    isNew
      ? PermissionKeysType.module_configuration_add
      : PermissionKeysType.module_configuration_edit
  )
  if (!canAccess)
    return (
      <PageAccessDenied
        title={isNew ? 'Создание конфигурации' : 'Редактирование конфигурации'}
      />
    )
  return <ConfigurationEditor key={`${moduleId}/${id}`} />
}

export default ConfigurationEditorPage
