import { Empty, Space, Tag, Typography } from 'antd'
import { FC, useEffect, useMemo, useRef, useState } from 'react'

import { SelectedAccessMethodPropsType } from '@widgets/SelectedAccessMethod/selected-access-method.type'

import { httpMethodColors } from '@utils/httpMethodColorUtils'

import { AccessListMethodType } from '@type/accessList.type'

import './selected-access-method.scss'

const getMethodKey = (method: string, httpMethod?: string) =>
  `${httpMethod || ''}_${method}`
const rowHeight = 36
const overscan = 8

const SelectedAccessMethod: FC<SelectedAccessMethodPropsType> = ({
  unknownMethodKey,
  allRoutes,
  methods,
  selectedMethod
}) => {
  const { Text } = Typography
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(360)

  const checkIsUnknownMethod = (method: AccessListMethodType) => {
    const routes = allRoutes[unknownMethodKey] || []
    return routes.find(
      (route) =>
        route.path === method.method && route.httpMethod === method.httpMethod
    )
  }

  const enabledMethods = useMemo(() => {
    const selectedMap = selectedMethod.reduce(
      (acc, method) => {
        const key = getMethodKey(method.method, method.httpMethod)
        acc[key] = method.value
        return acc
      },
      {} as Record<string, boolean>
    )

    const mergedMap = new Map<string, AccessListMethodType>()

    methods.forEach((method) => {
      const key = getMethodKey(method.method, method.httpMethod)
      const override = selectedMap[key]

      mergedMap.set(key, {
        ...method,
        value: override === undefined ? method.value : override
      })
    })

    selectedMethod.forEach((method) => {
      const key = getMethodKey(method.method, method.httpMethod)
      const baseMethod = mergedMap.get(key)

      if (baseMethod) {
        mergedMap.set(key, { ...baseMethod, value: method.value })
        return
      }

      mergedMap.set(key, method)
    })

    const mergedMethods = Array.from(mergedMap.values()).filter(
      (method) => method.value
    )

    const orderMap = new Map<string, number>()
    let order = 0

    Object.keys(allRoutes)
      .sort()
      .forEach((groupName) => {
        allRoutes[groupName].forEach((route) => {
          const key = getMethodKey(route.path, route.httpMethod)
          if (!orderMap.has(key)) {
            orderMap.set(key, order)
            order += 1
          }
        })
      })

    return mergedMethods.sort((a, b) => {
      const keyA = getMethodKey(a.method, a.httpMethod)
      const keyB = getMethodKey(b.method, b.httpMethod)
      const orderA = orderMap.get(keyA)
      const orderB = orderMap.get(keyB)

      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB
      }
      if (orderA !== undefined) {
        return -1
      }
      if (orderB !== undefined) {
        return 1
      }

      return keyA.localeCompare(keyB)
    })
  }, [methods, selectedMethod, allRoutes, unknownMethodKey])

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(Math.max(360, window.innerHeight - 315))
    }

    updateHeight()

    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  if (!enabledMethods.length) {
    return (
      <div className="selected-access-method selected-access-method--empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Нет разрешенных методов"
        />
      </div>
    )
  }

  const totalHeight = enabledMethods.length * rowHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2
  const endIndex = Math.min(enabledMethods.length, startIndex + visibleCount)
  const visibleMethods = enabledMethods.slice(startIndex, endIndex)

  return (
    <div
      ref={containerRef}
      className="selected-access-method"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div className="selected-access-method__virtual" style={{ height: totalHeight }}>
        {visibleMethods.map((method, index) => {
          const isUnknown = Boolean(checkIsUnknownMethod(method))
          const top = (startIndex + index) * rowHeight

          return (
            <div
              key={getMethodKey(method.method, method.httpMethod)}
              className="selected-access-method__item selected-access-method__row"
              style={{ top, height: rowHeight }}
            >
              <Space size={8} wrap>
                <Text
                  ellipsis
                  className={
                    isUnknown ? 'selected-access-method__unknown' : undefined
                  }
                  title={method.method}
                >
                  {method.method}
                </Text>
                {method.httpMethod && (
                  <Tag
                    className="access-list-tree__inner-tag"
                    color={httpMethodColors[method.httpMethod]}
                    bordered={false}
                  >
                    {method.httpMethod}
                  </Tag>
                )}
              </Space>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SelectedAccessMethod
