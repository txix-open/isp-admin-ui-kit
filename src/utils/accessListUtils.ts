import type { AccessListMethodType } from '../type/accessList.type'

export const getAccessMethodKey = (method: string, httpMethod?: string) =>
  `${httpMethod || ''}_${method}`

export const updateAccessMethodChanges = (
  methods: AccessListMethodType[],
  previousChanges: AccessListMethodType[],
  changes: AccessListMethodType[]
): AccessListMethodType[] => {
  const keyOf = (method: AccessListMethodType) =>
    getAccessMethodKey(method.method, method.httpMethod)
  const currentMethods = new Map(
    methods.map((method) => [keyOf(method), method])
  )
  const changedKeys = new Set(changes.map(keyOf))
  const nextChanges = previousChanges.filter(
    (method) => !changedKeys.has(keyOf(method))
  )

  changes.forEach((change) => {
    const currentMethod = currentMethods.get(keyOf(change))
    if ((currentMethod?.value ?? false) !== change.value) {
      nextChanges.push({
        ...change,
        // Preserve the backend representation when editing an existing method.
        httpMethod: currentMethod?.httpMethod ?? change.httpMethod
      })
    }
  })

  return nextChanges
}
