import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { theme } from 'antd'
import { MapToken, SeedToken } from 'antd/es/theme/interface'
import { createContext, Dispatch, SetStateAction } from 'react'

import accessListApi from '@services/accessListService.ts'
import appApi from '@services/appService.ts'
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

const rootReducer = combineReducers({
  profileReducer,
  UIReducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [userServiceApi.reducerPath]: userServiceApi.reducer,
  [sessionServiceApi.reducerPath]: sessionServiceApi.reducer,
  [securityLogServiceApi.reducerPath]: securityLogServiceApi.reducer,
  [appApi.reducerPath]: appApi.reducer,
  [accessListApi.reducerPath]: accessListApi.reducer,
  [routeApi.reducerPath]: routeApi.reducer,
  [modulesServiceApi.reducerPath]: modulesServiceApi.reducer,
  [applicationsGroupApi.reducerPath]: applicationsGroupApi.reducer,
  [applicationsApi.reducerPath]: applicationsApi.reducer,
  [configServiceApi.reducerPath]: configServiceApi.reducer,
  [tokensApi.reducerPath]: tokensApi.reducer
})

export const setupStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        roleApi.middleware,
        userServiceApi.middleware,
        securityLogServiceApi.middleware,
        appApi.middleware,
        accessListApi.middleware,
        routeApi.middleware,
        userServiceApi.middleware,
        sessionServiceApi.middleware,
        modulesServiceApi.middleware,
        applicationsGroupApi.middleware,
        applicationsApi.middleware,
        tokensApi.middleware,
        configServiceApi.middleware
      )
  })

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
