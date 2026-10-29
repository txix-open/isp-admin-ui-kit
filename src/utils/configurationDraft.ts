/** Compares JSON values without treating an array as an object or dropping empty values. */
export const equalConfigurationData = (
  left: unknown,
  right: unknown
): boolean => {
  if (left === right) return true
  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false
  if (Array.isArray(left) !== Array.isArray(right)) return false
  if (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length !== right.length
  )
    return false
  const leftObject = left as Record<string, unknown>
  const rightObject = right as Record<string, unknown>
  const keys = Object.keys(leftObject)
  return (
    keys.length === Object.keys(rightObject).length &&
    keys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(rightObject, key) &&
        equalConfigurationData(leftObject[key], rightObject[key])
    )
  )
}
