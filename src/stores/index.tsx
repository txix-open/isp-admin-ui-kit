import {
  combineReducers,
  configureStore,
  Middleware,
  Reducer
} from '@reduxjs/toolkit'
import { createContext, Dispatch, SetStateAction } from 'react'

import accessListApi from '@services/accessListService'
import applicationsGroupApi from '@services/applicationsGroupService'
import applicationsApi from '@services/applicationsService'
import configServiceApi from '@services/configService'
import modulesServiceApi from '@services/modulesService'
import roleApi from '@services/roleService'
import routeApi from '@services/routeService'
import securityLogServiceApi from '@services/securityLogService'
import sessionServiceApi from '@services/sessionService'
import swaggerServiceApi from '@services/swaggerService'
import tokensApi from '@services/tokensService'
import userServiceApi from '@services/userService'
import variablesApi from '@services/variablesService'

import { PermissionKeysType } from '@type/roles.type'

import profileReducer from './redusers/ProfileSlice'
import UIReducer from './redusers/UISlice'

export interface ContextProps {
  changeTheme: boolean
  setChangeTheme: Dispatch<SetStateAction<boolean>>
  excludePermissions: PermissionKeysType[]
}

export const Context = createContext<ContextProps>({
  changeTheme: false,
  setChangeTheme: () => false,
  excludePermissions: []
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
  swaggerServiceApi,
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

export const resetRootState = () => ({ type: 'RESET_STATE' })

export const resetApiCaches = () => (dispatch: Dispatch<any>) => {
  Object.values(baseApiServices).forEach((service) => {
    if (service && typeof service === 'object' && 'util' in service) {
      dispatch((service as any).util.resetApiState())
    }
  })
}

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

  const appReducer: Reducer = (state, action) => {
    if (action.type === 'RESET_STATE') {
      return rootReducer(undefined, action)
    }
    return rootReducer(state, action)
  }

  return configureStore({
    reducer: appReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiMiddlewares)
  })
}

const store = baseSetupStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
