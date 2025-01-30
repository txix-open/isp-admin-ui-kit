import {
  ActionReducerMapBuilder,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit'

import {
  ProfileDataType,
  ProfileType
} from '@pages/ProfilePage/profile-page.type.ts'

import { fetchProfile } from './ActionCreators.ts'

export enum StateProfileStatus {
  resolved = 'resolved',
  pending = 'pending',
  rejected = 'rejected',
  notInit = 'notInit'
}

export const initialState: ProfileType = {
  profile: {
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    roles: [],
    permissions: [],
    idleTimeoutMs: 0
  },
  status: StateProfileStatus.notInit,
  error: ''
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) {
      state.profile = initialState.profile
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<ProfileType>) => {
    builder
      .addCase(
        fetchProfile.fulfilled,
        (state, action: PayloadAction<ProfileDataType>) => {
          state.status = StateProfileStatus.resolved
          state.profile = { ...action.payload }
        }
      )
      .addCase(fetchProfile.pending, (state) => {
        state.status = StateProfileStatus.pending
      })
      .addCase(fetchProfile.rejected, (state, action: any) => {
        state.status = StateProfileStatus.rejected
        state.error = action.payload
      })
  }
})

export default profileSlice.reducer
