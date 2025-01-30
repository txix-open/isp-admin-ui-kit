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
    (typeof value === 'string' && value.trim() === '') || // Пустые строки
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
    return obj.map(cleanEmptyParamsObject).filter((item) => !isEmpty(item)) // Удаление пустых элементов в массиве
  }

  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = cleanEmptyParamsObject(obj[key]) // Рекурсивная обработка объектов

      if (!isEmpty(value)) {
        // Проверяем пустоту значения после рекурсивной обработки
        acc[key] = value // Сохраняем только непустые значения
      }

      return acc
    },
    {} as Record<string, unknown>
  )
}

export { sortObject, cleanEmptyParamsObject }
