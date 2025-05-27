import {
  combineReducers,
  configureStore,
  Middleware,
  Reducer
} from '@reduxjs/toolkit'
import { theme } from 'antd'
import { MapToken, SeedToken } from 'antd/es/theme/interface'
import { createContext, Dispatch, SetStateAction } from 'react'

import accessListApi from '@services/accessListService.ts'
import applicationsGroupApi from '@services/applicationsGroupService.ts'
import applicationsApi from '@services/applicationsService.ts'
import configServiceApi from '@services/configService.ts'
import modulesServiceApi from '@services/modulesService.ts'
import roleApi from '@services/roleService.ts'
import routeApi from '@services/routeService.ts'
import securityLogServiceApi from '@services/securityLogService.ts'
import sessionServiceApi from '@services/sessionService.ts'
import tokensApi from '@services/tokensService.ts'
import userServiceApi from '@services/userService.ts'
import variablesApi from '@services/variablesService.ts'

import profileReducer from './redusers/ProfileSlice.ts'
import UIReducer from './redusers/UISlice.ts'

export interface ContextProps {
  setTheme: Dispatch<
    SetStateAction<{
      algorithm: (token: SeedToken) => MapToken
      cssVar: boolean
      token: { colorBgLayout: string }
    }>
  >
  changeTheme: boolean
  setChangeTheme: Dispatch<SetStateAction<boolean>>
}

export const Context = createContext<ContextProps>({
  changeTheme: false,
  setChangeTheme: () => false,
  setTheme: () => theme.defaultAlgorithm
})

export const baseApiServices = {
  roleApi,
  userServiceApi,
  securityLogServiceApi,
  accessListApi,
  routeApi,
  applicationsGroupApi,
  applicationsApi,
  tokensApi,
  configServiceApi,
  modulesServiceApi,
  sessionServiceApi,
  variablesApi,
  UIReducer,
  profileReducer
}

type ApiService = {
  middleware: Middleware
  reducerPath: string
  reducer: Reducer
}

type ApiFunction = (...args: any[]) => any

export type ApiServices = Record<string, ApiService | ApiFunction>

type FunctionKeys = Record<string, ApiFunction>

export const baseSetupStore = (
  apiServices: ApiServices | undefined = {}
): ReturnType<typeof configureStore> => {
  const api: ApiServices =
    Object.keys(apiServices).length > 0
      ? { ...baseApiServices, ...apiServices }
      : baseApiServices

  const extractMiddlewares = (services: ApiServices) =>
    Object.values(services)
      .filter((api) => (api as ApiService).middleware)
      .map((api) => (api as ApiService).middleware)

  const findFunctionKeys = (obj: ApiServices): FunctionKeys =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => typeof value === 'function')
    ) as FunctionKeys

  const apiMiddlewares = extractMiddlewares(api)
  const functionKeys = findFunctionKeys(api)

  const apiReducerMap = Object.values(api)
    .filter(
      (api): api is ApiService => (api as ApiService).reducerPath !== undefined
    )
    .reduce((acc: Record<string, Reducer>, api: ApiService) => {
      acc[api.reducerPath] = api.reducer
      return acc
    }, {})

  const rootReducer = combineReducers({
    ...apiReducerMap,
    ...functionKeys
  })

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiMiddlewares)
  })
}
