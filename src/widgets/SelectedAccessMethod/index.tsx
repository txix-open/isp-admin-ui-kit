import { FC } from 'react'

import { SelectedAccessMethodPropsType } from '@widgets/SelectedAccessMethod/selected-access-method.type.ts'

import { AccessListMethodType } from '@type/accessList.type.ts'

import './selected-access-method.scss'

const SelectedAccessMethod: FC<SelectedAccessMethodPropsType> = ({
  unknownMethodKey,
  allRoutes,
  methods
}) => {
  const checkIsUnknownMethod = (method: string) => {
    const routes = allRoutes[unknownMethodKey] || []
    return routes.find((route) => route.path === method)
  }

  const renderMethodList = () => {
    const knownMethods: AccessListMethodType[] = []
    const unknownMethods: AccessListMethodType[] = []
    const sortAlphabetically = (
      a: AccessListMethodType,
      b: AccessListMethodType
    ) => a.method.localeCompare(b.method)
    methods.forEach((method) => {
      const isUnknown = checkIsUnknownMethod(method.method)
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
          className={`${checkIsUnknownMethod(method.method) ? 'unknown-label' : ''}`}
          key={method.method}
        >
          {method.method}
        </span>
      )
    })
  }

  return <div className="selected-access-method">{renderMethodList()}</div>
}

export default SelectedAccessMethod
