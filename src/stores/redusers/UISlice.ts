import {
  ActionReducerMapBuilder,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit'

import { UIDataType, UIType } from '@pages/ProfilePage/profile-page.type.ts'

import { StateProfileStatus } from '@stores/redusers/ProfileSlice.ts'

import { fetchUI } from './ActionCreators.ts'

export const initialState: UIType = {
  ui: {
    name: '',
    primaryColor: ''
  },
  status: StateProfileStatus.notInit,
  error: ''
}

export const UISlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    clearUI(state) {
      state.ui = initialState.ui
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<UIType>) => {
    builder
      .addCase(
        fetchUI.fulfilled,
        (state, action: PayloadAction<UIDataType>) => {
          state.status = StateProfileStatus.resolved
          state.ui = { ...action.payload }
        }
      )
      .addCase(fetchUI.pending, (state) => {
        state.status = StateProfileStatus.pending
      })
      .addCase(fetchUI.rejected, (state, action: any) => {
        state.status = StateProfileStatus.rejected
        state.error = action.payload
      })
  }
})

export default UISlice.reducer
