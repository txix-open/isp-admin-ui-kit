import { RollbackOutlined } from '@ant-design/icons'
import {
  Button,
  Dropdown,
  MenuProps,
  message,
  Radio,
  RadioChangeEvent, Space,
  Spin
} from 'antd'
import { AxiosError, AxiosResponse } from 'axios'
import { FC, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import ConfigSchemaModal from '@components/ConfigSchemaModal'
import ConfigurationEditorCode from '@components/ConfigurationEditorCode'
import ConfigurationEditorForm from '@components/ConfigurationEditorForm'
import ConfigurationEditorJson from '@components/ConfigurationEditorJson'
import ConfirmConfigModal from '@components/ConfirmConfigModal/ConfirmConfigModal.tsx'
import ErrorConfigModal from '@components/ErrorConfigModal/ErrorConfigModal.tsx'

import { ConfigType } from '@pages/ModulesPage/module.type.ts'

import { cleanEmptyParamsObject, sortObject, fastDeepEqualLite } from '@utils/objectUtils.ts'

import useRole from '@hooks/useRole.tsx'

import configServiceApi from '@services/configService.ts'
import modulesServiceApi from '@services/modulesService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { MSPError } from '@type/index.ts'
import { PermissionKeysType } from '@type/roles.type.ts'

import './configuration-editor-page.scss'

const ConfigurationEditorPage: FC = () => {
  const { hasPermission } = useRole()
  const navigate = useNavigate()
  const { moduleId = '' } = useParams()
  const { id = '' } = useParams()
  const isNew = id === 'new'
  const { data: jsonSchema, isLoading: isLoadingJsonSchema } =
    modulesServiceApi.useGetByModuleIdQuery(moduleId)
  const { data: currentConfig, isLoading: isCurrentConfigLoading } =
    configServiceApi.useGetConfigByIdQuery(id)
  const [createUpdateConfig] = configServiceApi.useCreateUpdateConfigMutation()
  const { state } = useLocation()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSchemeModal, setShowSchemeModal] = useState(false)
  const [radioValue, setRadioValue] = useState('json')
  const [bufConfig, setBufConfig] = useState<ConfigType>()
  const [detailsErrors, setDetailsError] = useState({
    details: {},
    isOpenDetailsErrorModal: false
  })
  const [disableBtn, setDisableBtn] = useState(false)
  const [disableSendBtn, setDisableSendBtn] = useState(true)
  const submitRef = useRef<any>(null)

  const isPageAvailable = hasPermission(
    PermissionKeysType.module_configuration_edit
  )
  const isUnsafeButton = hasPermission(
    PermissionKeysType.module_configuration_save_unsafe
  )

  const formRadio = 'form'
  const codeRadio = 'code'
  const jsonRadio = 'json'

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.home)
    }
  }, [isPageAvailable])

  useEffect(() => {
    if (!bufConfig || !currentConfig) return

    const isConfigsEqual = fastDeepEqualLite(bufConfig, currentConfig)
    setDisableSendBtn(!isConfigsEqual)
  }, [bufConfig, currentConfig])


  useEffect(() => {
    if (!bufConfig || !currentConfig) return

    const cleanedBufConfig = cleanEmptyParamsObject(bufConfig)
    const cleanedCurrentConfig = cleanEmptyParamsObject(currentConfig)

    const sortedBuf = sortObject(cleanedBufConfig)
    const sortedCurrent = sortObject(cleanedCurrentConfig)

    const isConfigsEqual =
      JSON.stringify(sortedBuf) === JSON.stringify(sortedCurrent)

    setDisableSendBtn(isConfigsEqual)
  }, [bufConfig, currentConfig])


  useEffect(() => {
    setBufConfig(isNew ? {} : sortObject(currentConfig))
  }, [isCurrentConfigLoading])


  const itemsSaveBtn = [
    {
      key: 'save',
      label: 'Сохранить'
    },
    {
      key: 'unsafe',
      label: 'Сохранить небезопасно'
    }
  ]

  const filteredItemsSaveBtn = !isUnsafeButton
    ? itemsSaveBtn.filter((item) => item.key !== 'unsafe')
    : itemsSaveBtn

  const goToConfigurationPage = () =>
    navigate(`${routePaths.modules}/${moduleId}/${routePaths.configurations}`)

  const onSaveBtn: MenuProps['onClick'] = (e, upVersion = undefined) => {
    const isUnsafe = e.key === 'unsafe'
    handleSaveClick(upVersion, isUnsafe, false)
  }

  const onRadioChange = (e: RadioChangeEvent) => {
    if (!bufConfig) return
    if (submitRef.current && radioValue === formRadio) {
      setBufConfig({ ...bufConfig, data: { ...submitRef.current } })
    }
    setRadioValue(e.target.value)
  }

  const handleSaveClick = (
    upVersion?: number,
    unsafe?: boolean,
    isGoBack?: boolean
  ) => {
    let newData = {}
    const sentData =
      radioValue === formRadio
        ? { ...bufConfig, data: { ...submitRef.current } }
        : { ...bufConfig }
    if (bufConfig) {
      if (isNew) {
        newData = {
          name: state.name,
          moduleId: moduleId,
          id: '',
          version: 0,
          data: sentData.data,
          unsafe: unsafe
        } as ConfigType
      }
      if (currentConfig) {
        newData = {
          ...sentData,
          version: upVersion ? upVersion : currentConfig.version,
          unsafe: unsafe
        } as ConfigType
      }
    }
    createUpdateConfig(cleanEmptyParamsObject(newData))
      .unwrap()
      .then(({ id }) => {
        isNew && navigate(`/${moduleId}/configEditor/${id}`)
        isGoBack && navigate(`/modules/${moduleId}/configurations`)
        message.success('Конфигурация успешно сохранена')
      })
      .catch((e: AxiosError<MSPError>) => {
        const { response } = e
        const { data } = response as AxiosResponse<MSPError>
        const errorCode = parseInt(data.errorCode)
        if (errorCode === 2004) {
          setShowConfirmModal(true)
        }
        if (errorCode === 2003) {
          setDetailsError({
            details: data.details,
            isOpenDetailsErrorModal: true
          })
        }
        if (errorCode === 400) {
          message.error('Невалидный JSON объект')
        }
        message.error('Ошибка обновления элемента')
      })
  }

  if (isLoadingJsonSchema || isCurrentConfigLoading) {
    return <Spin className="spin" />
  }

  const renderContent = () => {
    switch (radioValue) {
      case formRadio:
        return (
          <ConfigurationEditorForm
            currentConfig={currentConfig}
            submitRef={submitRef}
            bufConfig={bufConfig as ConfigType}
            setBufConfig={setBufConfig}
            jsonSchema={jsonSchema}
            isCurrentConfigLoading={isCurrentConfigLoading}
            setDisableBtn={setDisableBtn}
            setDisableSendBtn={setDisableSendBtn}
          />
        )
      case jsonRadio:
        return (
          <ConfigurationEditorJson
            bufConfig={bufConfig as ConfigType}
            setBufConfig={setBufConfig}
            isCurrentConfigLoading={isCurrentConfigLoading}
          />
        )
      case codeRadio:
        return (
          <ConfigurationEditorCode
            setDisableBtn={setDisableBtn}
            bufConfig={bufConfig as ConfigType}
            setBufConfig={setBufConfig}
            jsonSchema={jsonSchema}
            isCurrentConfigLoading={isCurrentConfigLoading}
          />
        )
    }
  }

  return (
    <main className="configuration-editor-page">
      <section className="configuration-editor-page__header">
        <Button onClick={goToConfigurationPage}>
          <RollbackOutlined />
          Назад
        </Button>
        <Space>
          <h1>{bufConfig?.name}</h1>
          <p className="change-status">({disableSendBtn ? 'нет изменений' : 'есть измнения'})
            <span
              className={`change-status-circle ${disableSendBtn ? 'change-status_red' : 'change-status_green'}`}
            />
          </p>
        </Space>

        <div className="configuration-editor-page__controll">
          <Button
            disabled={!jsonSchema}
            className="configurations____buttons__show-schema-btn"
            onClick={() => setShowSchemeModal(true)}
          >
            Текущая схема конфигурации
          </Button>
          <Dropdown.Button
            onClick={() => handleSaveClick(undefined, undefined, true)}
            disabled={disableBtn || disableSendBtn}
            type="primary"
            className="configuration-editor-page__save-btn"
            menu={{ items: filteredItemsSaveBtn, onClick: onSaveBtn }}
          >
            Сохранить и выйти
          </Dropdown.Button>
        </div>
      </section>
      <div className="configuration-editor-page__content">
        <Radio.Group
          defaultValue={jsonRadio}
          disabled={disableBtn}
          size="large"
          onChange={onRadioChange}
        >
          <Radio.Button value={formRadio}>Форма</Radio.Button>
          <Radio.Button disabled={disableBtn} value={jsonRadio}>
            JSON
          </Radio.Button>
          <Radio.Button value={codeRadio}>Редактор кода</Radio.Button>
        </Radio.Group>

        {renderContent()}
      </div>

      <ConfigSchemaModal
        schema={jsonSchema?.schema}
        open={showSchemeModal}
        onClose={() => setShowSchemeModal(false)}
      />

      <ConfirmConfigModal
        currentConfig={currentConfig}
        setBufConfig={setBufConfig}
        open={showConfirmModal}
        handleSaveClick={handleSaveClick}
        onClose={() => setShowConfirmModal(false)}
      />

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

export default ConfigurationEditorPage
