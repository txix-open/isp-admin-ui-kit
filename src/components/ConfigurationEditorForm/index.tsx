import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Theme as AntDTheme } from '@rjsf/antd'
import { withTheme } from '@rjsf/core'
import { UiSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import {
  Badge,
  Button,
  Tabs,
  Tooltip,
  Collapse,
  Typography,
  Space
} from 'antd'
import equal from 'deep-equal'
import { createRef, FC, memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  ArrayFieldTemplatePropsType,
  ConfigurationEditorPropsType,
  DescriptionPropsType,
  ErrorsObjType,
  ObjectFieldTemplatePropertyType,
  ObjectFieldTemplatePropsType,
  RemoveButtonProps,
  SortPropType
} from '@pages/ConfigurationEditorPage/ConfigurationEditor.type.ts'
import { ResponseSchemaType } from '@pages/ModulesPage/module.type.ts'

import { cleanEmptyParamsObject } from '@utils/objectUtils.ts'

const { Text: AntdText } = Typography

const ConfigurationEditorForm: FC<ConfigurationEditorPropsType> = ({
  bufConfig = {},
  jsonSchema = {},
  submitRef
}) => {
  const Form = withTheme(AntDTheme)
  const sortProps = (a: SortPropType, b: SortPropType) =>
    a.name.localeCompare(b.name)

  const [formState, setFormState] = useState(bufConfig.data)
  const { id } = useParams()
  const formRef = createRef<any>()

  useEffect(() => {
    if (!equal(formState, bufConfig.data)) {
      setFormState(bufConfig.data)
    }
  }, [bufConfig.data])

  const uiSchema: UiSchema = {
    'ui:submitButtonOptions': {
      norender: true
    }
  }

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

  const onFormChange = () => {
    if (!formRef.current) return
    if (
      formRef.current.validateFormWithFormData(formRef.current.state.formData)
    ) {
      formRef?.current?.submit()
    } else {
      forceSubmit()
    }
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

  const ArrayFieldTemplate: FC<ArrayFieldTemplatePropsType> = ({
    items,
    onAddClick,
    canAdd,
    title,
    idSchema
  }) => {
    return (
      <Collapse defaultActiveKey={idSchema.$id}>
        <Collapse.Panel
          key={idSchema.$id}
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
          {items &&
            items.map((element) => (
              <div key={element.index} className="collapseArray_item">
                <div className="collapseArray_item_content">
                  {element.children}
                </div>
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={element.onDropIndexClick(element.index)}
                />
              </div>
            ))}
        </Collapse.Panel>
      </Collapse>
    )
  }

  const RemoveButton = (props: RemoveButtonProps) => {
    const { icon, iconType, ...btnProps } = props
    return (
      <Button
        type="link"
        icon={<DeleteOutlined />}
        {...btnProps}
      />
    )
  }

  const ObjectFieldTemplate: FC<ObjectFieldTemplatePropsType> = (props) => {
    const { properties, schema, idSchema, onAddClick, activeTabKey, handleTabsChange, title } = props
    const depth = getDepth(idSchema.$id)

    const renderComplexTabs = (propsComplex: any[]) => {
      return (
        propsComplex.map((element) => ({
          label: schema.properties[element.name]?.title || element.name,
          key: element.name,
          children: schema.additionalProperties
            ? (properties.map((element: any) => (
              <div key={element.content.key} className="collapseArray_item">
                <div className="collapseArray_item_content">{element.content}</div>
              </div>
            )))
            : <>{element.content}</>
        }))
      )
    }

    const propsComplex: ObjectFieldTemplatePropertyType[] = []
    const propsSimple: ObjectFieldTemplatePropertyType[] = []

    const processProperties = (properties: any) => {
      properties.forEach((prop: any) => {
        const fieldType = schema.properties[prop.name]?.type
        const isComplex = !fieldType || fieldType === 'array' || fieldType === 'object'
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

    if (idSchema.$id === 'root') {
      return (
        <Tabs
          activeKey={activeTabKey}
          tabPosition="right"
          onChange={handleTabsChange}
          items={[
            ...(propsSimple.length ? [{
              label: 'Остальные',
              key: 'General',
              children: propsSimple.map((element) => element.content)
            }] : []),
            ...renderComplexTabs(propsComplex)
          ]}
        />
      )
    }

    if (schema.additionalProperties) {
      return (
        <Collapse className="collapse" defaultActiveKey={depth > 1 ? '' : idSchema.$id}>
          <Collapse.Panel
            key={idSchema.$id}
            className="configEditor_collapseObject"
            header={
              <Space direction="horizontal" style={{ justifyContent: 'space-between', width: '100%' }}>
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
                    onAddClick(schema)()
                  }}
                />
              </Space>
            }
          >
            {properties.map((element: any) => (
              <div key={element.content.key} className="collapseArray_item">
                <div className="collapseArray_item_content">{element.content}</div>
              </div>
            ))}
          </Collapse.Panel>
        </Collapse>
      )
    }

    if (depth > 2) {
      return (
        <Collapse className="collapse" defaultActiveKey={depth > 1 ? '' : idSchema.$id}>
          <Collapse.Panel
            key={idSchema.$id}
            className="configEditor_collapseObject"
            header={<><Tooltip title={title}>{title}</Tooltip></>}
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
          labelCol: { span: 8 },
          wrapperCol: { span: 30 },
          layout: 'vertical'
        }}
        uiSchema={uiSchema}
        templates={{
          ObjectFieldTemplate: ObjectFieldTemplate as any,
          ArrayFieldTemplate: ArrayFieldTemplate as any,
          ButtonTemplates: { RemoveButton } as any
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
