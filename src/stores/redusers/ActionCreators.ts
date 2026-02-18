import { createAsyncThunk } from '@reduxjs/toolkit'

import { apiPaths } from '@constants/api/apiPaths'

import {
  ProfileDataType,
  UIDataType
} from '@pages/ProfilePage/profile-page.type'

import { initUI } from '@utils/UIUtiles'

import { apiService } from '@services/apiService'

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.post<ProfileDataType>(
        apiPaths.getProfile
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)
export const fetchUI = createAsyncThunk(
  'ui/fetchUI',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.post<UIDataType>(apiPaths.getUI)
      initUI(response.data)
      return response.data
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)
