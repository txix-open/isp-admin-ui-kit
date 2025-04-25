const sortObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObject)
  }

  const sorted: any = {}
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortObject(obj[key])
    })
  return sorted
}

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      true &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0)
  )
}

function cleanEmptyParamsObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanEmptyParamsObject).filter((item) => !isEmpty(item))
  }

  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = cleanEmptyParamsObject(obj[key])

      if (!isEmpty(value)) {

        acc[key] = value
      }

      return acc
    },
    {} as Record<string, unknown>
  )
}

 function fastDeepEqualLite(a: any, b: any): boolean {
  if (a === b) return true

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false
  }

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false

    const valA = a[key]
    const valB = b[key]

    const areObjects =
      typeof valA === 'object' &&
      valA !== null &&
      typeof valB === 'object' &&
      valB !== null

    if (areObjects) {
      if (!fastDeepEqualLite(valA, valB)) return false
    } else if (valA !== valB) {
      return false
    }
  }

  return true
}

export { sortObject, cleanEmptyParamsObject, fastDeepEqualLite }
