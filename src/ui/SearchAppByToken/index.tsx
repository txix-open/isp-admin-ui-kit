import { SearchOutlined } from '@ant-design/icons'
import { Input, message } from 'antd'
import { SearchProps } from 'antd/es/input'
import { useNavigate } from 'react-router-dom'

import applicationsApi from '@services/applicationsService.ts'

import { routePaths } from '@routes/routePaths.ts'

import './search-app-by-token.scss'

const { Search } = Input

export interface SearchAppByTokenType {
  applicationId: number
  applicationGroupId: number
}

const SearchAppByToken = () => {
  const navigate = useNavigate()
  const [getApplicationByToken, { isLoading }] =
    applicationsApi.useGetApplicationGetApplicationByTokenMutation()

  const handleSearch: SearchProps['onSearch'] = (value, _, info) => {
    if (info?.source === 'clear') {
      return
    }
    const trimmedToken = value.trim()
    if (!trimmedToken) {
      message.warning('Введите токен перед поиском')
      return
    }

    getApplicationByToken({ token: trimmedToken })
      .unwrap()
      .then((data) => {
        const { applicationId, applicationGroupId } = data
        navigate(
          `${routePaths.applicationsGroup}/${applicationGroupId}/${routePaths.application}/${applicationId}`
        )
      })
      .catch((e) => {
        if (e?.status === 404) {
          message.error('Приложение с таким токеном не найдено')
          return
        }
        message.error('Что-то пошло не так')
      })
  }

  return (
    <Search
      className="search-app-by-token"
      onSearch={handleSearch}
      placeholder="Введите токен приложения"
      enterButton={<SearchOutlined />}
      loading={isLoading}
      allowClear
    />
  )
}

export default SearchAppByToken
