import { RJSFSchema } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'

import { cleanEmptyParamsObjectWithArrayIndices } from '@utils/objectUtils'

/** Validate the outgoing JSON while keeping error positions in the untouched draft. */
const createConfigurationValidator = (rootSchema?: RJSFSchema) => {
  const validator = customizeValidator()
  const rawValidation = validator.rawValidation.bind(validator)
  validator.rawValidation = <Result = unknown>(
    schema: RJSFSchema,
    formData?: unknown
  ) => {
    const arrayIndices = new WeakMap<unknown[], number[]>()
    const cleaned = cleanEmptyParamsObjectWithArrayIndices(
      formData,
      (array, indices) => arrayIndices.set(array, indices)
    )
    const result = rawValidation<Result>(schema, cleaned)
    const remapPath = (pointer: string) => {
      if (!pointer) return pointer
      let original: unknown = formData
      const segments = pointer
        .slice(1)
        .split('/')
        .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'))
      const path = segments.map((segment) => {
        const mapped = Array.isArray(original)
          ? String(arrayIndices.get(original)?.[Number(segment)] ?? segment)
          : segment
        original =
          original !== null &&
          typeof original === 'object' &&
          Object.prototype.hasOwnProperty.call(original, mapped)
            ? (original as Record<string, unknown>)[mapped]
            : undefined
        return mapped.replace(/~/g, '~0').replace(/\//g, '~1')
      })
      return `/${path.join('/')}`
    }
    return {
      ...result,
      errors: result.errors?.map((error) => {
        if (
          error &&
          typeof error === 'object' &&
          'instancePath' in error &&
          typeof error.instancePath === 'string'
        ) {
          return { ...error, instancePath: remapPath(error.instancePath) }
        }
        return error
      })
    }
  }
  const validateFormData = validator.validateFormData.bind(validator)
  validator.validateFormData = (data, schema, ...options) =>
    validateFormData(data, rootSchema ?? schema, ...options)
  // isValid remains unchanged: RJSF uses it to choose and render schema alternatives.
  return validator
}

export default createConfigurationValidator
