import { DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { Empty, Popconfirm, Tag, Tooltip, Tree, TreeProps } from 'antd'
import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { AccessListTreePropsType } from '@widgets/AccessListTree/access-list-tree.type'

import { TableActionButton } from '@components/TableUI'

import {
  getHttpMethodLabel,
  matchesAccessRoute
} from '@utils/accessRouteFilters'
import { httpMethodColors } from '@utils/httpMethodColorUtils'

import useRole from '@hooks/useRole'

import {
  AccessListMethodTypeBase,
  BaseEndpoint,
  EndpointType
} from '@type/accessList.type'
import { PermissionKeysType } from '@type/roles.type'

import './access-list-tree.scss'

const unknownMethodKey = 'неизвестные методы'

const getNodeKey = (path: string, httpMethod?: string) =>
  httpMethod ? `${httpMethod}:${path}` : path

const renderHighlightedPath = (path: string, search: string): ReactNode => {
  if (!search) {
    return path
  }

  const source = path.toLowerCase()
  const query = search.toLowerCase()
  const parts: ReactNode[] = []

  let startIndex = 0
  let matchIndex = source.indexOf(query, startIndex)

  while (matchIndex !== -1) {
    if (matchIndex > startIndex) {
      parts.push(path.slice(startIndex, matchIndex))
    }

    const endIndex = matchIndex + query.length
    parts.push(
      <mark
        className="access-list-tree__path-highlight"
        key={`${path}-${matchIndex}`}
      >
        {path.slice(matchIndex, endIndex)}
      </mark>
    )

    startIndex = endIndex
    matchIndex = source.indexOf(query, startIndex)
  }

  if (startIndex < path.length) {
    parts.push(path.slice(startIndex))
  }

  return parts
}

const AccessListTree: FC<AccessListTreePropsType> = ({
  searchValue,
  defaultAllRoutes,
  methods,
  selectedMethod = [],
  selectedHttpMethods = [],
  showChangedOnly = false,
  disabled = false,
  onCheck = [],
  onRemoveUnknownMethods = undefined
}) => {
  const { hasPermission } = useRole()
  const containerRef = useRef<HTMLDivElement>(null)
  const wasFilteredRef = useRef(false)
  const filterSignatureRef = useRef('')
  const expandedBeforeFilterRef = useRef<string[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [treeHeight, setTreeHeight] = useState(360)

  const handleRemoveUnknownMethods = (methods: BaseEndpoint[]) => {
    if (!onRemoveUnknownMethods || disabled) {
      return
    }
    onRemoveUnknownMethods(methods)
  }

  const createTreeData = (
    data: Record<string, (EndpointType | BaseEndpoint)[]>
  ) => {
    const unknownMethods = data[unknownMethodKey]

    return Object.keys(data)
      .sort()
      .map((routeKey) => {
        if (routeKey === unknownMethodKey) {
          return {
            title: (
              <span className="unknown-label">
                {routeKey} <WarningOutlined />
                {onRemoveUnknownMethods && (
                  <Tooltip title="Удалить">
                    <Popconfirm
                      title="Удалить показанные неизвестные методы?"
                      description="Методы будут удалены из сохранённых прав приложения."
                      okText="Удалить"
                      cancelText="Отмена"
                      okButtonProps={{ danger: true }}
                      disabled={disabled}
                      onConfirm={() =>
                        handleRemoveUnknownMethods(unknownMethods)
                      }
                    >
                      <TableActionButton
                        danger
                        disabled={disabled}
                        aria-label="Удалить показанные неизвестные методы"
                        onClick={(event) => event.stopPropagation()}
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Tooltip>
                )}
              </span>
            ),
            key: routeKey,
            children: data[routeKey].map((route) => createTreeNode(route, true))
          }
        }
        return {
          title: routeKey,
          key: routeKey,
          children: data[routeKey].map((route) => createTreeNode(route))
        }
      })
  }

  const currentMethodStatusMap = useMemo(
    () =>
      methods.reduce(
        (acc, method) => {
          const key = getNodeKey(method.method, method.httpMethod)
          acc[key] = method.value
          return acc
        },
        {} as Record<string, boolean>
      ),
    [methods]
  )

  const selectedMethodStatusMap = useMemo(
    () =>
      selectedMethod.reduce(
        (acc, method) => {
          const key = getNodeKey(method.method, method.httpMethod)
          acc[key] = method.value
          return acc
        },
        {} as Record<string, boolean>
      ),
    [selectedMethod]
  )

  const isMethodChanged = useCallback(
    (obj: EndpointType | BaseEndpoint) => {
      const key = getNodeKey(obj.path, obj.httpMethod)
      const currentValue = currentMethodStatusMap[key] ?? false
      const hasOverride = key in selectedMethodStatusMap

      if (!hasOverride) {
        return false
      }

      return selectedMethodStatusMap[key] !== currentValue
    },
    [currentMethodStatusMap, selectedMethodStatusMap]
  )

  const createTreeNode = useCallback(
    (obj: EndpointType | BaseEndpoint, unknown = false) => {
      const showRemoveBtn = unknown && onRemoveUnknownMethods
      const nodeKey = getNodeKey(obj.path, obj.httpMethod)
      const changed = isMethodChanged(obj)

      return {
        title: (
          <span
            className={[
              'access-list-tree__span',
              unknown ? 'unknown-label' : '',
              changed ? 'access-list-tree__span--changed' : ''
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {
              <span className="access-list-tree__method-tag">
                <Tag
                  className="access-list-tree__inner-tag"
                  color={httpMethodColors[obj.httpMethod]}
                  bordered={false}
                  title={
                    obj.httpMethod?.trim() ? undefined : 'HTTP-метод не указан'
                  }
                >
                  {getHttpMethodLabel(obj.httpMethod)}
                </Tag>
              </span>
            }
            <span className="access-list-tree__path" title={obj.path}>
              {renderHighlightedPath(obj.path, searchValue.trim())}
            </span>

            {showRemoveBtn && (
              <Tooltip title="Удалить">
                <Popconfirm
                  title="Удалить неизвестный метод?"
                  description={`${getHttpMethodLabel(obj.httpMethod)} ${obj.path}`}
                  okText="Удалить"
                  cancelText="Отмена"
                  okButtonProps={{ danger: true }}
                  disabled={disabled}
                  onConfirm={() => handleRemoveUnknownMethods([obj])}
                >
                  <TableActionButton
                    danger
                    disabled={disabled}
                    aria-label={`Удалить неизвестный метод ${getHttpMethodLabel(obj.httpMethod)} ${obj.path}`}
                    onClick={(event) => event.stopPropagation()}
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            )}
            <div>
              {'inner' in obj && obj.inner ? (
                <Tag
                  className="access-list-tree__inner-tag"
                  color="processing"
                  bordered={false}
                >
                  Внутренний
                </Tag>
              ) : null}
            </div>
          </span>
        ),
        key: nodeKey,
        path: obj.path,
        httpMethod: obj.httpMethod,
        changed
      }
    },
    [isMethodChanged, onRemoveUnknownMethods, searchValue, disabled]
  )

  const filteredRoutes = useMemo(() => {
    const filteredRoute: Record<string, EndpointType[]> = {}

    Object.keys(defaultAllRoutes).forEach((groupName) => {
      const filterArray = defaultAllRoutes[groupName].filter((endpoint) => {
        const matchesChanged = showChangedOnly
          ? isMethodChanged(endpoint)
          : true

        return (
          matchesAccessRoute(endpoint, searchValue, selectedHttpMethods) &&
          matchesChanged
        )
      })

      if (filterArray.length) {
        filteredRoute[groupName] = filterArray
      }
    })

    return filteredRoute
  }, [
    defaultAllRoutes,
    searchValue,
    selectedHttpMethods,
    showChangedOnly,
    isMethodChanged
  ])

  const treeData = useMemo(
    () => createTreeData(filteredRoutes),
    [filteredRoutes, createTreeNode, onRemoveUnknownMethods, disabled]
  )

  const getCheckedKeys = () => {
    const checkedKeys = new Set<string>()

    methods.forEach(({ method, httpMethod, value }) => {
      if (value) {
        checkedKeys.add(getNodeKey(method, httpMethod))
      }
    })

    selectedMethod.forEach(
      ({ method, httpMethod, value }: AccessListMethodTypeBase) => {
        const key = getNodeKey(method, httpMethod)

        if (value) {
          checkedKeys.add(key)
        } else {
          checkedKeys.delete(key)
        }
      }
    )

    return Array.from(checkedKeys)
  }

  const filteredCheckedKeys = () => {
    const isStringPresent = (string: string) => {
      for (const service of treeData) {
        for (const endpoint of service.children) {
          if (endpoint.key === string) {
            return true
          }
        }
      }
      return false
    }

    const keys = getCheckedKeys()
    return keys.filter((string) => isStringPresent(string))
  }

  const filteredKeys = filteredCheckedKeys()
  const isFilteredMode =
    Boolean(searchValue) || showChangedOnly || selectedHttpMethods.length > 0
  const groupKeys = useMemo(
    () => Object.values(treeData).map((node) => node.key),
    [treeData]
  )
  const filterSignature = JSON.stringify([
    searchValue,
    showChangedOnly,
    selectedHttpMethods,
    groupKeys
  ])

  useEffect(() => {
    if (isFilteredMode) {
      if (!wasFilteredRef.current)
        expandedBeforeFilterRef.current = expandedKeys
      if (filterSignatureRef.current !== filterSignature)
        setExpandedKeys(groupKeys)
      filterSignatureRef.current = filterSignature
    } else if (!isFilteredMode && wasFilteredRef.current) {
      setExpandedKeys(expandedBeforeFilterRef.current)
      filterSignatureRef.current = ''
    }

    wasFilteredRef.current = isFilteredMode
  }, [isFilteredMode, expandedKeys, groupKeys, filterSignature])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const updateHeight = () =>
      setTreeHeight(Math.max(1, Math.floor(container.clientHeight)))
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="access-list-tree">
      {!treeData.length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            isFilteredMode
              ? 'По заданным условиям методы не найдены'
              : 'Маршрутов пока нет'
          }
        />
      ) : (
        <Tree
          itemHeight={36}
          blockNode
          disabled={disabled}
          className="app-access-content__main__tree"
          checkable={hasPermission(PermissionKeysType.app_access_edit)}
          checkedKeys={filteredKeys}
          expandedKeys={expandedKeys}
          height={treeHeight}
          onExpand={(keys) => setExpandedKeys(keys as string[])}
          onCheck={onCheck as TreeProps['onCheck']}
          treeData={treeData}
        />
      )}
    </div>
  )
}

export default memo(AccessListTree)
