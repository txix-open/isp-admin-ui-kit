import { DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Tag, Tooltip, Tree, TreeProps } from 'antd'
import { FC, memo, useCallback, useEffect, useState } from 'react'

import { AccessListTreePropsType } from '@widgets/AccessListTree/access-list-tree.type.ts'

import useRole from '@hooks/useRole.tsx'

import { EndpointType } from '@type/accessList.type.ts'
import { PermissionKeysType } from '@type/roles.type.ts'

import './access-list-tree.scss'

const unknownMethodKey = 'неизвестные методы'

const AccessListTree: FC<AccessListTreePropsType> = ({
  searchValue,
  defaultAllRoutes,
  methods,
  selectedMethod = [],
  onCheck = [],
  onRemoveUnknownMethods = undefined
}) => {
  const { hasPermission } = useRole()
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const handleRemoveUnknownMethods = (methods: string[]) => {
    if (!onRemoveUnknownMethods) {
      return
    }
    onRemoveUnknownMethods(methods)
  }

  const createTreeData = (data: Record<string, EndpointType[]>) => {
    const unknownMethods = data[unknownMethodKey]?.map(
      (objMethod) => objMethod.path
    )
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

  const createTreeNode = useCallback((obj: EndpointType, unknown = false) => {
    const showRemoveBtn = unknown && onRemoveUnknownMethods

    return {
      title: (
        <span className={`${unknown ? 'unknown-label' : ''}`}>
          {obj.path}
          {showRemoveBtn && (
            <Tooltip title="Удалить">
              <Popconfirm
                title="Удалить неизвестный метод?"
                onConfirm={() => handleRemoveUnknownMethods([obj.path])}
              >
                <Button icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
          {obj.inner ? (
            <Tag
              className="access-list-tree__inner-tag"
              color="processing"
              bordered={false}
            >
              Внутренний
            </Tag>
          ) : null}
        </span>
      ),
      key: obj.path
    }
  }, [])

  const filteredRoute = () => {
    if (!searchValue) {
      return defaultAllRoutes
    }
    const filteredRoute: Record<string, EndpointType[]> = {}
    Object.keys(defaultAllRoutes).forEach((groupName) => {
      const filterArray = defaultAllRoutes[groupName].filter(({ path }) =>
        path.toLowerCase().includes(searchValue)
      )
      if (filterArray.length) {
        filteredRoute[groupName] = filterArray
      }
    })
    return filteredRoute
  }

  const treeData = createTreeData(filteredRoute())

  const getCheckedKeys = () => {
    const checkedKeys = new Set<string>()

    methods.forEach(({ method, value }) => {
      if (value) {
        checkedKeys.add(method)
      }
    })

    selectedMethod.forEach(({ method, value }: any) => {
      if (value) {
        checkedKeys.add(method)
      } else {
        checkedKeys.delete(method)
      }
    })

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

  useEffect(() => {
    if (!searchValue) {
      setExpandedKeys([])
      return
    }
    const keys = Object.values(treeData).map((node) => node.key)
    setExpandedKeys(keys)
  }, [searchValue])

  return (
    <div className="access-list-tree">
      <Tree
        className="app-access-content__main__tree"
        checkable={hasPermission(PermissionKeysType.app_access_edit)}
        checkedKeys={filteredKeys}
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys as string[])}
        onCheck={onCheck as TreeProps['onCheck']}
        treeData={treeData}
      />
    </div>
  )
}

export default memo(AccessListTree)
