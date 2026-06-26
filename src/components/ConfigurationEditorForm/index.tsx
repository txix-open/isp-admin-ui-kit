import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Theme as AntDTheme } from '@rjsf/antd'
import { IChangeEvent, withTheme } from '@rjsf/core'
import { RJSFSchema, UiSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { Badge, Button, Tabs, Tooltip, Collapse, Typography, Space } from 'antd'
import {
  createRef,
  FC,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useParams } from 'react-router-dom'

import CustomDatePicker from '@widgets/CustomDatePicker'

import {
  ArrayFieldItemTemplatePropsType,
  ArrayFieldTemplatePropsType,
  ConfigurationEditorPropsType,
  DescriptionPropsType,
  ErrorsObjType,
  ObjectFieldTemplatePropertyType,
  ObjectFieldTemplatePropsType,
  RemoveButtonProps,
  SortPropType
} from '@pages/ConfigurationEditorPage/ConfigurationEditor.type'
import { ResponseSchemaType } from '@pages/ModulesPage/module.type'

import {
  cleanEmptyParamsObject,
  sortObject,
  fastDeepEqualLite
} from '@utils/objectUtils'

const { Text: AntdText } = Typography

const ConfigurationEditorForm: FC<ConfigurationEditorPropsType> = ({
  bufConfig,
  jsonSchema,
  submitRef,
  setDisableSendBtn = () => {},
  currentConfig
}) => {
  const Form = withTheme(AntDTheme)
  const sortProps = (a: SortPropType, b: SortPropType) =>
    a.name.localeCompare(b.name)

  const [formState, setFormState] = useState(bufConfig.data)

  const cleanedCurrentConfigDataString = useMemo(() => {
    const cleaned = cleanEmptyParamsObject(currentConfig?.data || {})
    const sorted = sortObject(cleaned)
    return JSON.stringify(sorted)
  }, [currentConfig?.data])

  const { id } = useParams()
  const formRef = createRef<any>()

  useEffect(() => {
    if (!fastDeepEqualLite(formState, bufConfig.data)) {
      setFormState(bufConfig.data)
    }
  }, [bufConfig])

  useEffect(() => {
    return () => {
      debouncedValidateAndCompare.cancel()
    }
  }, [])

  const uiSchema: UiSchema = {
    'ui:submitButtonOptions': {
      norender: true
    }
  }

  function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null

    const debounced = (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        func(...args)
      }, wait)
    }

    debounced.cancel = () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    }

    return debounced
  }

  const debouncedValidateAndCompare = useRef(
    debounce((formData: any) => {
      const cleanedFormData = cleanEmptyParamsObject(formData)
      const sortedFormData = sortObject(cleanedFormData)
      const cleanedFormDataString = JSON.stringify(sortedFormData)

      if (cleanedFormDataString !== cleanedCurrentConfigDataString) {
        setDisableSendBtn(false)
      } else {
        setDisableSendBtn(true)
      }

      if (
        formRef.current?.validateFormWithFormData(
          formRef.current.state.formData
        )
      ) {
        formRef?.current?.submit()
      } else {
        forceSubmit()
      }
    }, 300)
  ).current

  const onSubmit = (data: any) => {
    if (!submitRef) return
    if (
      !formRef.current.validateFormWithFormData(formRef.current.state.formData)
    ) {
      submitRef.current = data
    } else {
      submitRef.current = data.formData
    }
  }

  const forceSubmit = () => {
    if (formRef.current) {
      const formData = formRef.current.state.formData
      onSubmit(cleanEmptyParamsObject(formData))
    }
  }

  const onFormChange = (e: IChangeEvent<any, RJSFSchema, any>) => {
    debouncedValidateAndCompare(e.formData)
  }

  const Description: FC<DescriptionPropsType> = ({ description }) =>
    description ? (
      <span>
        &nbsp;
        <Tooltip title={description}></Tooltip>
      </span>
    ) : null

  const getDepth = (id: string) => {
    if (!id) {
      return 0
    }
    return id.split('_').length
  }

  const getFieldId = (
    fieldPathId?: { $id?: string },
    idSchema?: { $id?: string }
  ) => fieldPathId?.$id || idSchema?.$id || 'root'

  const ArrayFieldTemplate: FC<ArrayFieldTemplatePropsType> = ({
    items,
    onAddClick,
    canAdd,
    title,
    fieldPathId,
    idSchema
  }) => {
    const fieldId = getFieldId(fieldPathId, idSchema)

    return (
      <Collapse defaultActiveKey={fieldId}>
        <Collapse.Panel
          key={fieldId}
          className="collapseArray"
          header={
            <Space
              direction="horizontal"
              style={{ justifyContent: 'space-between', width: '100%' }}
            >
              <Space direction="horizontal">
                <Tooltip title={title}>
                  <AntdText>{title}</AntdText>
                </Tooltip>
                <Badge count={items ? items.length : 0} showZero />
                <Description description={title} />
              </Space>
              {canAdd && (
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddClick(e as unknown as MouseEvent)
                  }}
                />
              )}
            </Space>
          }
        >
          {items}
        </Collapse.Panel>
      </Collapse>
    )
  }

  const ArrayFieldItemTemplate: FC<ArrayFieldItemTemplatePropsType> = ({
    children,
    itemKey,
    index,
    hasToolbar,
    buttonsProps
  }) => {
    const canRemove = hasToolbar && buttonsProps?.hasRemove

    return (
      <div key={itemKey || index} className="collapseArray_item">
        <div className="collapseArray_item_content">{children}</div>
        {canRemove && (
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={buttonsProps?.onRemoveItem}
          />
        )}
      </div>
    )
  }

  const RemoveButton = (props: RemoveButtonProps) => {
    const { icon, iconType, ...btnProps } = props
    return <Button type="link" icon={<DeleteOutlined />} {...btnProps} />
  }

  const ObjectFieldTemplate: FC<ObjectFieldTemplatePropsType> = (props) => {
    const {
      properties,
      schema,
      fieldPathId,
      idSchema,
      onAddClick,
      onAddProperty,
      activeTabKey,
      handleTabsChange,
      title
    } = props
    const fieldId = getFieldId(fieldPathId, idSchema)
    const schemaProperties = schema.properties || {}
    const depth = getDepth(fieldId)

    const renderComplexTabs = (propsComplex: any[]) => {
      return propsComplex.map((element) => ({
        label: schemaProperties[element.name]?.title || element.name,
        key: element.name,
        children: schema.additionalProperties ? (
          properties.map((element: any) => (
            <div key={element.content.key} className="collapseArray_item">
              <div className="collapseArray_item_content">
                {element.content}
              </div>
            </div>
          ))
        ) : (
          <>{element.content}</>
        )
      }))
    }

    const propsComplex: ObjectFieldTemplatePropertyType[] = []
    const propsSimple: ObjectFieldTemplatePropertyType[] = []

    const processProperties = (properties: any) => {
      properties.forEach((prop: any) => {
        const fieldType = schemaProperties[prop.name]?.type
        const isComplex =
          !fieldType || fieldType === 'array' || fieldType === 'object'
        if (isComplex) {
          propsComplex.push(prop)
        } else {
          propsSimple.push(prop)
        }
      })
    }

    if (!schema.additionalProperties) {
      properties.sort(sortProps)
    }
    processProperties(properties)

    if (fieldId === 'root') {
      return (
        <Tabs
          className="configuration-editor-page__root-tabs"
          activeKey={activeTabKey}
          tabPosition="right"
          onChange={handleTabsChange}
          items={[
            ...(propsSimple.length
              ? [
                  {
                    label: 'Остальные',
                    key: 'General',
                    children: propsSimple.map((element) => element.content)
                  }
                ]
              : []),
            ...renderComplexTabs(propsComplex)
          ]}
        />
      )
    }

    if (schema.additionalProperties) {
      const handleAddProperty = onAddProperty || onAddClick?.(schema)

      return (
        <Collapse
          className="collapse"
          defaultActiveKey={depth > 1 ? '' : fieldId}
        >
          <Collapse.Panel
            key={fieldId}
            className="configEditor_collapseObject"
            header={
              <Space
                direction="horizontal"
                style={{ justifyContent: 'space-between', width: '100%' }}
              >
                <Space direction="horizontal">
                  <Tooltip title={title}>
                    <AntdText>{title}</AntdText>
                  </Tooltip>
                </Space>
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddProperty?.()
                  }}
                />
              </Space>
            }
          >
            {properties.map((element: any) => (
              <div key={element.content.key} className="collapseArray_item">
                <div className="collapseArray_item_content">
                  {element.content}
                </div>
              </div>
            ))}
          </Collapse.Panel>
        </Collapse>
      )
    }

    if (depth > 2) {
      return (
        <Collapse
          className="collapse"
          defaultActiveKey={depth > 1 ? '' : fieldId}
        >
          <Collapse.Panel
            key={fieldId}
            className="configEditor_collapseObject"
            header={<Tooltip title={title}>{title}</Tooltip>}
          >
            <>{properties.map((element) => element.content)}</>
          </Collapse.Panel>
        </Collapse>
      )
    }

    return properties.map((element) => element.content)
  }

  const transformErrors = (errors: ErrorsObjType[]): ErrorsObjType[] => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        error.message = 'Поле является обязательным'
      })
    }
    return errors
  }

  return (
    <section className="configuration-editor-page__form">
      <Form
        formContext={{
          labelCol: { span: 24 },
          wrapperCol: { span: 24 },
          layout: 'vertical'
        }}
        uiSchema={uiSchema}
        templates={{
          ObjectFieldTemplate: ObjectFieldTemplate as any,
          ArrayFieldTemplate: ArrayFieldTemplate as any,
          ArrayFieldItemTemplate: ArrayFieldItemTemplate as any,
          ButtonTemplates: { RemoveButton } as any
        }}
        widgets={{
          'date-time': CustomDatePicker
        }}
        ref={formRef}
        transformErrors={transformErrors as any}
        schema={jsonSchema?.schema as ResponseSchemaType}
        onSubmit={onSubmit}
        validator={validator}
        formData={id === 'new' ? {} : formState}
        onChange={onFormChange}
        showErrorList={false}
      ></Form>
    </section>
  )
}

export default memo(ConfigurationEditorForm)
