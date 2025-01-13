import { RollbackOutlined } from '@ant-design/icons'
import { Button, Dropdown, MenuProps, message, Radio, RadioChangeEvent, Spin } from 'antd'
import { FC, useEffect, useRef, useState} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import ConfigurationEditorCode from '@components/ConfigurationEditorCode'
import ConfigurationEditorJson from '@components/ConfigurationEditorJson'

import configServiceApi from '@services/configService.ts'
import modulesServiceApi from '@services/modulesService.ts'

import './configuration-editor-page.scss'
import ConfigSchemaModal from '@components/ConfigSchemaModal'
import { cleanEmptyParamsObject, sortObject } from '@utils/objectUtils.ts'
import { ConfigType } from '@pages/ModulesPage/module.type.ts'
import ConfirmConfigModal from '@components/ConfirmConfigModal/ConfirmConfigModal.tsx'
import ErrorConfigModal from '@components/ErrorConfigModal/ErrorConfigModal.tsx'
import ConfigurationEditorForm from '@components/ConfigurationEditorForm'



const ConfigurationEditorPage: FC = () => {
  const navigate = useNavigate()
  const { moduleId = '' } = useParams()
  const { id = '' } = useParams()
  const isNew = id === 'new'
  const { data: jsonSchema, isLoading: isLoadingJsonSchema } =
    modulesServiceApi.useGetByModuleIdQuery(moduleId)
  const {
    data: currentConfig,
    isLoading: isCurrentConfigLoading,
  } = configServiceApi.useGetConfigByIdQuery(id)
  const [createUpdateConfig] = configServiceApi.useCreateUpdateConfigMutation()
  const { state } = useLocation()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSchemeModal, setShowSchemeModal] = useState(false)
  const [radioValue, setRadioValue] = useState('json')
  const [bufConfig, setBufConfig] = useState<ConfigType>()
  const [detailsErrors, setDetailsError] = useState({ details: {}, isOpenDetailsErrorModal: false })
  const [disableBtn, setDisableBtn] = useState(false)
  const submitRef = useRef<any>(null)

  const formRadio = 'form'
  const codeRadio = 'code'
  const jsonRadio = 'json'

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

  const handleSaveClick = (upVersion?: number, unsafe?: boolean, isGoBack?: boolean) => {
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
      .catch((e) => {
        if (e.data.errorCode === 2004) {
          setShowConfirmModal(true)
        }
        if (e.data.errorCode === 2003) {
          setDetailsError({ details: e.data.details, isOpenDetailsErrorModal: true })
        }
        if (e.data.errorCode === 400) {
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
            submitRef={submitRef}
            bufConfig={bufConfig as ConfigType}
            setBufConfig={setBufConfig}
            jsonSchema={jsonSchema}
            isCurrentConfigLoading={isCurrentConfigLoading}
            setDisableBtn={setDisableBtn}
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
            isCurrentConfigLoading={isCurrentConfigLoading}
          />
        )
    }
  }


  return (
    <main className="configuration-editor-page">
      <section className="configuration-editor-page__header">
        <Button onClick={() => navigate(-1)}>
          <RollbackOutlined />
          Назад
        </Button>
        <h1>{bufConfig?.name}</h1>
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
            disabled={disableBtn}
            type="primary"
            className="configuration-editor-page__save-btn"
            menu={{ items: itemsSaveBtn, onClick: onSaveBtn }}
          >
            Сохранить и выйти
          </Dropdown.Button>
        </div>

      </section>
      <div className="configuration-editor-page__content">
        <Radio.Group defaultValue={jsonRadio} disabled={disableBtn} size="large" onChange={onRadioChange}>
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
        onClose={() => setShowConfirmModal(false)} />

      <ErrorConfigModal details={detailsErrors.details} open={detailsErrors.isOpenDetailsErrorModal}
                        onClose={() => setDetailsError({details: {}, isOpenDetailsErrorModal: false })} />

    </main>
  )
}

export default ConfigurationEditorPage
