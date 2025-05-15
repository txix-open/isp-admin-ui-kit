import { Input, message } from 'antd'
import { useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import applicationsApi from '@services/applicationsService.ts'
import { useNavigate } from 'react-router-dom'
const { Search } = Input

import './search-app-by-token.scss'

export interface SearchAppByTokenType  {
  applicationId: number
  applicationGroupId: number
}
const SearchAppByToken = () => {
  const [token, setToken] = useState('')

  const navigate = useNavigate()

  const [useGetApplicationGetApplicationByTokenMutation, { isLoading }] =
    applicationsApi.useGetApplicationGetApplicationByTokenMutation()

  const handleSearch = async () => {

    useGetApplicationGetApplicationByTokenMutation({ token }).unwrap().then(data => {
      const {applicationId, applicationGroupId} = data
          navigate( `/application_groups/${applicationGroupId}/application/${applicationId}`)
    }).catch(e => {

      if(e.status === 404) {
        message.error('Приложение с таким токеном не найдено')
        return
      }

      message.error('Что то пошло не так')
    })
  }

  return (
    <Search
      className="search-app-by-token"
      value={token}
      onChange={(e) => setToken(e.target.value)}
      onSearch={handleSearch}
      placeholder="Введите токен приложения"
      enterButton={<SearchOutlined />}
      loading={isLoading}
      allowClear
    />
  )
}

export default SearchAppByToken