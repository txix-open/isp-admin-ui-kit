import { Tag } from 'antd'
import { FC } from 'react'

import { SelectedAccessMethodPropsType } from '@widgets/SelectedAccessMethod/selected-access-method.type'

import { httpMethodColors } from '@utils/httpMethodColorUtils'

import { AccessListMethodType } from '@type/accessList.type'

import './selected-access-method.scss'

const SelectedAccessMethod: FC<SelectedAccessMethodPropsType> = ({
  unknownMethodKey,
  allRoutes,
  methods
}) => {
  const checkIsUnknownMethod = (method: AccessListMethodType) => {
    const routes = allRoutes[unknownMethodKey] || []
    return routes.find(
      (route) =>
        route.path === method.method && route.httpMethod === method.httpMethod
    )
  }

  const renderMethodList = () => {
    const knownMethods: AccessListMethodType[] = []
    const unknownMethods: AccessListMethodType[] = []
    const sortAlphabetically = (
      a: AccessListMethodType,
      b: AccessListMethodType
    ) => a.method.localeCompare(b.method)
    methods.forEach((method: AccessListMethodType) => {
      const isUnknown = checkIsUnknownMethod(method)
      if (isUnknown) {
        unknownMethods.push(method)
      } else {
        knownMethods.push(method)
      }
    })

    const mergedMethods = [
      ...knownMethods.sort(sortAlphabetically),
      ...unknownMethods.sort(sortAlphabetically)
    ]
    const allMethodsDisabled = mergedMethods.every((method) => !method.value)

    if (allMethodsDisabled) {
      return <h3>Нет разрешенных методов</h3>
    }
    return mergedMethods.map((method) => {
      if (!method.value) {
        return null
      }
      return (
        <span
          className={`${checkIsUnknownMethod(method) ? 'unknown-label' : ''}`}
          key={`${method.httpMethod}_${method.method}`}
        >
          {method.method}
          {method.httpMethod && (
            <Tag
              className="access-list-tree__inner-tag"
              color={httpMethodColors[method.httpMethod]}
              bordered={false}
            >
              {method.httpMethod}
            </Tag>
          )}
        </span>
      )
    })
  }

  return <div className="selected-access-method">{renderMethodList()}</div>
}

export default SelectedAccessMethod
