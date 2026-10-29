import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { Theme as AntDTheme } from '@rjsf/antd'
import { IChangeEvent, withTheme } from '@rjsf/core'
import {
  ArrayFieldItemTemplateProps,
  ArrayFieldTemplateProps,
  ADDITIONAL_PROPERTY_FLAG,
  FieldTemplateProps,
  WrapIfAdditionalTemplateProps,
  canExpand,
  ObjectFieldTemplatePropertyType,
  ObjectFieldTemplateProps,
  RJSFSchema,
  UiSchema
} from '@rjsf/utils'
import {
  Button,
  Collapse,
  Form as AntForm,
  Grid,
  Input,
  Space,
  Tabs,
  Tooltip
} from 'antd'
import {
  cloneElement,
  FC,
  isValidElement,
  memo,
  ReactElement,
  ReactNode,
  useRef,
  useMemo
} from 'react'

import CustomDatePicker from '@widgets/CustomDatePicker'

import {
  ConfigurationEditorPropsType,
  ErrorsObjType,
  RemoveButtonProps
} from '@pages/ConfigurationEditorPage/ConfigurationEditor.type'

import { equalConfigurationData } from '@utils/configurationDraft'

import './configuration-editor-form.scss'
import createConfigurationValidator from './configurationValidator'
import useAlignedFormLabels from './useAlignedFormLabels'

const Form = withTheme(AntDTheme)
const BaseFieldTemplate = AntDTheme.templates!
  .FieldTemplate as FC<FieldTemplateProps>
const FieldTemplate: FC<FieldTemplateProps> = (props) => {
  const types = Array.isArray(props.schema.type)
    ? props.schema.type
    : [props.schema.type]
  const container = types.includes('object') || types.includes('array')
  const reserveHelp = !container && !props.rawErrors?.length && !props.rawHelp
  return (
    <BaseFieldTemplate
      {...props}
      rawHelp={reserveHelp ? ' ' : props.rawHelp}
      help={reserveHelp ? <span aria-hidden="true">&nbsp;</span> : props.help}
      rawDescription={container ? undefined : props.rawDescription}
    />
  )
}

const WrapIfAdditionalTemplate: FC<WrapIfAdditionalTemplateProps> = (props) => {
  const {
    children,
    classNames,
    style,
    schema,
    id,
    label,
    disabled,
    readonly,
    registry,
    onKeyRenameBlur,
    onRemoveProperty
  } = props
  if (!(ADDITIONAL_PROPERTY_FLAG in schema))
    return (
      <div className={classNames} style={style}>
        {children}
      </div>
    )
  const types = Array.isArray(schema.type) ? schema.type : [schema.type]
  const complex = types.includes('object') || types.includes('array')
  const { readonlyAsDisabled = true } = registry.formContext
  return (
    <div
      className={`${classNames} config-form__additional${complex ? ' config-form__additional--complex' : ''}`}
      style={style}
    >
      <div className="config-form__additional-key">
        <AntForm.Item
          label="Ключ"
          htmlFor={`${id}-key`}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Input
            key={label}
            id={`${id}-key`}
            name={`${id}-key`}
            defaultValue={label}
            disabled={disabled || (readonly && readonlyAsDisabled)}
            readOnly={readonly}
            onBlur={!readonly ? onKeyRenameBlur : undefined}
            onPressEnter={(event) => {
              event.preventDefault()
              event.currentTarget.blur()
            }}
          />
        </AntForm.Item>
      </div>
      <div className="config-form__additional-value">
        {!complex && isValidElement(children)
          ? cloneElement(children as ReactElement<{ label?: ReactNode }>, {
              label: 'Значение'
            })
          : children}
      </div>
      <div className="config-form__additional-actions">
        <Tooltip title={`Удалить поле «${label}»`}>
          <Button
            type="text"
            danger
            disabled={disabled || readonly}
            aria-label={`Удалить поле «${label}»`}
            icon={<DeleteOutlined />}
            onClick={onRemoveProperty}
          />
        </Tooltip>
      </div>
    </div>
  )
}

const SectionHeading = ({
  title,
  description,
  count
}: {
  title: string
  description?: string
  count?: number
}) => (
  <span className="config-form__heading">
    <span className="config-form__heading-line">
      <span>{title}</span>
      {count !== undefined && (
        <span className="config-form__count">{count}</span>
      )}
    </span>
    {description && (
      <span className="config-form__description">{description}</span>
    )}
  </span>
)

const Section = ({
  id,
  title,
  description,
  count,
  children,
  expanded = true,
  kind = 'object'
}: {
  id: string
  title: string
  description?: string
  count?: number
  children: ReactNode
  expanded?: boolean
  kind?: 'object' | 'array'
}) => (
  <Collapse
    className={`config-form__section config-form__section--${kind}`}
    defaultActiveKey={expanded ? [id] : []}
    items={[
      {
        key: id,
        label: (
          <SectionHeading
            title={title}
            description={description}
            count={count}
          />
        ),
        children
      }
    ]}
  />
)

const ArrayFieldTemplate: FC<ArrayFieldTemplateProps> = ({
  items,
  onAddClick,
  canAdd,
  title,
  schema,
  fieldPathId,
  disabled,
  readonly,
  optionalDataControl
}) => {
  const name = fieldPathId.path[fieldPathId.path.length - 1]
  const sectionTitle = title || (typeof name === 'string' ? name : 'Список')

  return (
    <Section
      id={fieldPathId.$id}
      title={sectionTitle}
      kind="array"
      description={schema.description}
      count={items.length}
    >
      {optionalDataControl}
      <div className="config-form__items">
        {items.length ? (
          items
        ) : (
          <p className="config-form__empty">Элементов пока нет</p>
        )}
      </div>
      {canAdd && (
        <Button
          className="config-form__add"
          icon={<PlusOutlined />}
          disabled={disabled || readonly}
          onClick={onAddClick}
        >
          Добавить элемент в «{sectionTitle}»
        </Button>
      )}
    </Section>
  )
}

const ArrayFieldItemTemplate: FC<ArrayFieldItemTemplateProps> = ({
  children,
  index,
  hasToolbar,
  buttonsProps,
  disabled,
  readonly
}) => {
  const locked =
    disabled || readonly || buttonsProps.disabled || buttonsProps.readonly
  const actions = [
    {
      show: buttonsProps.hasMoveUp,
      label: 'Переместить выше',
      icon: <ArrowUpOutlined />,
      onClick: buttonsProps.onMoveUpItem
    },
    {
      show: buttonsProps.hasMoveDown,
      label: 'Переместить ниже',
      icon: <ArrowDownOutlined />,
      onClick: buttonsProps.onMoveDownItem
    },
    {
      show: buttonsProps.hasCopy,
      label: 'Создать копию элемента',
      icon: <CopyOutlined />,
      onClick: buttonsProps.onCopyItem
    }
  ]
  return (
    <div className="config-form__array-item">
      <div className="config-form__array-item-header">
        <span>Элемент {index + 1}</span>
        {hasToolbar && (
          <Space size={0} wrap>
            {actions
              .filter((action) => action.show)
              .map((action) => (
                <Tooltip key={action.label} title={action.label}>
                  <Button
                    type="text"
                    disabled={locked}
                    icon={action.icon}
                    aria-label={`${action.label}: ${index + 1}`}
                    onClick={action.onClick}
                  />
                </Tooltip>
              ))}
            {buttonsProps.hasRemove && (
              <Button
                type="text"
                danger
                disabled={locked}
                icon={<DeleteOutlined />}
                aria-label={`Удалить элемент ${index + 1}`}
                onClick={buttonsProps.onRemoveItem}
              >
                Удалить
              </Button>
            )}
          </Space>
        )}
      </div>
      <div className="config-form__array-item-body">{children}</div>
    </div>
  )
}

const RemoveButton = (props: RemoveButtonProps) => {
  const { icon, iconType, ...buttonProps } = props
  return (
    <Tooltip title="Удалить поле">
      <Button
        type="text"
        danger
        aria-label="Удалить поле"
        icon={<DeleteOutlined />}
        {...buttonProps}
      />
    </Tooltip>
  )
}

// RJSF supplies the resolved schema here, including references and dynamic properties.
const getPropertySchema = (
  property: ObjectFieldTemplatePropertyType
): RJSFSchema =>
  (property.content.props as { schema?: RJSFSchema }).schema || {}

const isComplexProperty = (property: ObjectFieldTemplatePropertyType) => {
  const schema = getPropertySchema(property)
  const types = Array.isArray(schema.type) ? schema.type : [schema.type]
  return (
    types.includes('object') ||
    types.includes('array') ||
    Boolean(
      schema.properties ||
      schema.items ||
      schema.oneOf ||
      schema.anyOf ||
      schema.allOf ||
      !schema.type
    )
  )
}

const PropertyGrid = ({
  properties
}: {
  properties: ObjectFieldTemplatePropertyType[]
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  useAlignedFormLabels(gridRef, properties)
  return (
    <div className="config-form__grid" ref={gridRef}>
      {properties.map((property) => {
        const schema = getPropertySchema(property)
        const contentProps = property.content.props as { uiSchema?: UiSchema }
        const widget = contentProps.uiSchema?.['ui:widget']
        const complex = isComplexProperty(property)
        const wide =
          complex || widget === 'textarea' || ADDITIONAL_PROPERTY_FLAG in schema
        const checkbox =
          !(ADDITIONAL_PROPERTY_FLAG in schema) &&
          schema.type === 'boolean' &&
          (!widget || widget === 'checkbox')
        return (
          <div
            className={[
              'config-form__field',
              wide && 'config-form__field--wide',
              complex && 'config-form__field--complex',
              checkbox && 'config-form__field--checkbox'
            ]
              .filter(Boolean)
              .join(' ')}
            key={property.name}
          >
            {property.content}
          </div>
        )
      })}
    </div>
  )
}

const ObjectFieldTemplate: FC<ObjectFieldTemplateProps> = ({
  properties: sourceProperties,
  schema,
  fieldPathId,
  onAddProperty,
  title,
  disabled,
  readonly,
  uiSchema,
  formData,
  optionalDataControl
}) => {
  const screens = Grid.useBreakpoint()
  const dynamic = Boolean(
    schema.additionalProperties || schema.patternProperties
  )
  const properties = sourceProperties.filter((property) => !property.hidden)
  if (!dynamic) properties.sort((a, b) => a.name.localeCompare(b.name))
  const path = fieldPathId.path
  const isRoot = path.length === 0
  const name = path[path.length - 1]
  const isArrayItem = typeof name === 'number'
  const sectionTitle = title || (isRoot ? 'Параметры' : String(name))
  const addProperty = canExpand(schema, uiSchema, formData) && (
    <Button
      className="config-form__add"
      icon={<PlusOutlined />}
      disabled={disabled || readonly}
      onClick={onAddProperty}
    >
      {isArrayItem
        ? `Добавить поле в элемент ${name + 1}`
        : `Добавить поле в «${sectionTitle}»`}
    </Button>
  )
  const body = (
    <>
      {optionalDataControl}
      {properties.length ? (
        <PropertyGrid properties={properties} />
      ) : (
        <p className="config-form__empty">Полей пока нет</p>
      )}
      {addProperty}
    </>
  )

  if (isRoot && !dynamic) {
    const simple = properties.filter((property) => !isComplexProperty(property))
    const complex = properties.filter(isComplexProperty)
    const sections = [
      ...(simple.length
        ? [
            {
              key: 'general',
              label: 'Основные',
              children: (
                <section className="config-form__main-section">
                  <h3>Основные параметры</h3>
                  <PropertyGrid properties={simple} />
                </section>
              )
            }
          ]
        : []),
      ...complex.map((property) => {
        const propertySchema = getPropertySchema(property)
        const label = propertySchema.title || property.name
        return {
          key: `property:${property.name}`,
          label: (
            <span className="config-form__nav-label">
              <span>{label}</span>
              {label !== property.name && <code>{property.name}</code>}
            </span>
          ),
          children: property.content
        }
      })
    ]
    if (sections.length <= 1)
      return (
        <div className="config-form__root">
          {schema.description && (
            <p className="config-form__root-description">
              {schema.description}
            </p>
          )}
          {sections.length ? (
            <>
              {optionalDataControl}
              {sections[0].children}
            </>
          ) : (
            body
          )}
        </div>
      )
    return (
      <div className="config-form__root">
        {schema.description && (
          <p className="config-form__root-description">{schema.description}</p>
        )}
        {optionalDataControl}
        <Tabs
          className="config-form__tabs"
          tabPosition={screens.lg ? 'right' : 'top'}
          items={sections}
        />
      </div>
    )
  }

  // The array item already provides a header and boundary for its fields.
  if (isArrayItem)
    return (
      <div className="config-form__object-fields">
        {schema.description && (
          <p className="config-form__root-description">{schema.description}</p>
        )}
        {body}
      </div>
    )
  return (
    <Section
      id={fieldPathId.$id}
      title={sectionTitle}
      description={schema.description}
      count={properties.length}
      expanded={path.length <= 2}
    >
      {body}
    </Section>
  )
}

const transformErrors = (errors: ErrorsObjType[]): ErrorsObjType[] =>
  errors.map((error) =>
    error.name === 'required'
      ? { ...error, message: 'Поле является обязательным' }
      : error
  )

const ConfigurationEditorForm: FC<ConfigurationEditorPropsType> = ({
  bufConfig,
  jsonSchema,
  setBufConfig,
  disabled = false
}) => {
  const validator = useMemo(
    () =>
      createConfigurationValidator(
        jsonSchema?.schema as RJSFSchema | undefined
      ),
    [jsonSchema?.schema]
  )
  const uiSchema: UiSchema = { 'ui:submitButtonOptions': { norender: true } }
  const onFormChange = (event: IChangeEvent) => {
    if (disabled) return
    setBufConfig((previous) =>
      previous && !equalConfigurationData(previous.data, event.formData)
        ? { ...previous, data: event.formData }
        : previous
    )
  }
  return (
    <section className="configuration-editor-page__form config-form">
      <Form
        formContext={{
          labelCol: { span: 24 },
          wrapperCol: { span: 24 },
          layout: 'vertical'
        }}
        uiSchema={uiSchema}
        templates={{
          FieldTemplate,
          WrapIfAdditionalTemplate,
          ObjectFieldTemplate,
          ArrayFieldTemplate,
          ArrayFieldItemTemplate,
          ButtonTemplates: { RemoveButton } as any
        }}
        widgets={{ 'date-time': CustomDatePicker }}
        transformErrors={transformErrors as any}
        schema={jsonSchema?.schema as RJSFSchema}
        validator={validator}
        formData={bufConfig.data}
        onChange={onFormChange}
        disabled={disabled}
        liveValidate
        showErrorList={false}
      />
    </section>
  )
}

export default memo(ConfigurationEditorForm)
