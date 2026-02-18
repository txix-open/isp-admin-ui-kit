import { MessageInstance } from 'antd/es/message/interface'
import { AxiosError } from 'axios'
import { UseFormSetError, FieldValues, Path } from 'react-hook-form'

import { MSPError } from '@type/index'

type ErrorHandlerOptions<T extends FieldValues> = {
  setError?: UseFormSetError<T>
  fieldName?: string
  message?: MessageInstance
}

const handleVariableApiError = <T extends FieldValues>(
  error: AxiosError<MSPError>,
  defaultMessage: string,
  options?: ErrorHandlerOptions<T>
) => {
  const { response, status } = error
  const { setError, fieldName = 'name', message } = options || {}

  if (response && status === 400) {
    switch (parseInt(response.data.errorCode)) {
      case 2006: {
        message?.error('Переменная c таким именем не найдена')
        break
      }
      case 2007: {
        if (setError && fieldName) {
          setError(fieldName as Path<T>, {
            message: 'Переменная с таким именем уже существует'
          })
        } else {
          message?.error('Переменная с таким именем уже существует')
        }
        break
      }
      case 2008: {
        message?.error(
          'Переменная используется в конфигурациях и не может быть удалена'
        )
        break
      }
    }
  } else {
    message?.error(defaultMessage)
  }
}

export { handleVariableApiError }
