import { DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Tag, Tooltip, Tree, TreeProps } from 'antd'
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
  onCheck = [],
  onRemoveUnknownMethods = undefined
}) => {
  const { hasPermission } = useRole()
  const containerRef = useRef<HTMLDivElement>(null)
  const wasFilteredRef = useRef(false)
  const expandedBeforeFilterRef = useRef<string[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [treeHeight, setTreeHeight] = useState(360)

  const handleRemoveUnknownMethods = (methods: BaseEndpoint[]) => {
    if (!onRemoveUnknownMethods) {
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
                      title="Удалить все неизвестные методы?"
                      onConfirm={() =>
                        handleRemoveUnknownMethods(unknownMethods)
                      }
                    >
                      <Button icon={<DeleteOutlined />} />
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
            <div>{renderHighlightedPath(obj.path, searchValue)}</div>

            <div>
              {obj.httpMethod && (
                <Tag
                  className="access-list-tree__inner-tag"
                  color={httpMethodColors[obj.httpMethod]}
                  bordered={false}
                >
                  {obj.httpMethod}
                </Tag>
              )}
            </div>

            {showRemoveBtn && (
              <Tooltip title="Удалить">
                <Popconfirm
                  title="Удалить неизвестный метод?"
                  onConfirm={() => handleRemoveUnknownMethods([obj])}
                >
                  <Button icon={<DeleteOutlined />} />
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
    [isMethodChanged, onRemoveUnknownMethods, searchValue]
  )

  const filteredRoutes = useMemo(() => {
    const filteredRoute: Record<string, EndpointType[]> = {}

    const hasHttpFilter = selectedHttpMethods.length > 0

    Object.keys(defaultAllRoutes).forEach((groupName) => {
      const filterArray = defaultAllRoutes[groupName].filter((endpoint) => {
        const matchesSearch = searchValue
          ? endpoint.path.toLowerCase().includes(searchValue)
          : true
        const matchesHttpMethod = hasHttpFilter
          ? selectedHttpMethods.includes(endpoint.httpMethod)
          : true
        const matchesChanged = showChangedOnly ? isMethodChanged(endpoint) : true

        return matchesSearch && matchesHttpMethod && matchesChanged
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
    [filteredRoutes, createTreeNode, onRemoveUnknownMethods]
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

  useEffect(() => {
    if (isFilteredMode && !wasFilteredRef.current) {
      expandedBeforeFilterRef.current = expandedKeys
      setExpandedKeys(groupKeys)
    } else if (!isFilteredMode && wasFilteredRef.current) {
      setExpandedKeys(expandedBeforeFilterRef.current)
    }

    wasFilteredRef.current = isFilteredMode
  }, [isFilteredMode, expandedKeys, groupKeys])

  useEffect(() => {
    const updateHeight = () => {
      setTreeHeight(Math.max(360, window.innerHeight - 315))
    }

    updateHeight()

    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return (
    <div ref={containerRef} className="access-list-tree">
      <Tree
        className="app-access-content__main__tree"
        checkable={hasPermission(PermissionKeysType.app_access_edit)}
        checkedKeys={filteredKeys}
        expandedKeys={expandedKeys}
        height={treeHeight}
        onExpand={(keys) => setExpandedKeys(keys as string[])}
        onCheck={onCheck as TreeProps['onCheck']}
        treeData={treeData}
      />
    </div>
  )
}

export default memo(AccessListTree)
