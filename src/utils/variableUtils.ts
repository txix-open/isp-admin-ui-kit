import { AxiosError } from 'axios'
import { UseFormSetError, FieldValues, Path } from 'react-hook-form'

import { MSPError } from '@type/index'

import { ignoreApiError, notifyApiError } from './apiErrorNotifications'

type ErrorHandlerOptions<T extends FieldValues> = {
  setError?: UseFormSetError<T>
  fieldName?: string
}

const handleVariableApiError = <T extends FieldValues>(
  error: AxiosError<MSPError>,
  defaultMessage: string,
  options?: ErrorHandlerOptions<T>
) => {
  const { response, status } = error
  const { setError, fieldName = 'name' } = options || {}

  if (response && (response.status ?? status) === 400) {
    switch (parseInt(response.data?.errorCode ?? '', 10)) {
      case 2006: {
        notifyApiError(error, 'Переменная c таким именем не найдена')
        return
      }
      case 2007: {
        if (setError && fieldName) {
          ignoreApiError(error)
          setError(fieldName as Path<T>, {
            message: 'Переменная с таким именем уже существует'
          })
        } else {
          notifyApiError(error, 'Переменная с таким именем уже существует')
        }
        return
      }
      case 2008: {
        notifyApiError(
          error,
          'Переменная используется в конфигурациях и не может быть удалена'
        )
        return
      }
    }
  }
  notifyApiError(error, defaultMessage)
}

export { handleVariableApiError }
