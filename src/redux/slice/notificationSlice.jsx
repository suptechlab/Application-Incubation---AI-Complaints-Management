import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { userApi } from '../api/axios';
import EndPoint from '../api/endpoint';
import { _ } from 'ajv';


const initialState = {
  loading: false,
}

// NOTIFICATION LIST
export const notificationListApi = createAsyncThunk(
  'notificationListApi',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.get(`${EndPoint.NOTIFICATION_LIST}`);
      if (response.status !== 200) {
        return rejectWithValue('Failed to send notification!');
      }
      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// READ SINGLE NOTIFICATION
export const readSingleNotification = createAsyncThunk(
  'readSingleNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await userApi.post(`${EndPoint.READ_SINGLE_NOTIFICATION}/${notificationId}/mark-as-read`);
      if (response.status !== 200) {
        return rejectWithValue('Failed to send notification!');
      }
      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// READ ALL NOTIFICATIONS
export const readAllNotifications = createAsyncThunk(
  'readAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.post(`${EndPoint.READ_ALL_NOTIFICATIONS}`);
      if (response.status !== 200) {
        return rejectWithValue('Failed to send notification!');
      }
      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// DELETE SINGLE NOTIFICATION
export const deleteSingleNotification = createAsyncThunk(
  'deleteSingleNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await userApi.delete(`${EndPoint.DELETE_SINGLE_NOTIFICATION}/${notificationId}`);
      if (response.status !== 200) {
        return rejectWithValue('Failed to send notification!');
      }
      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// DELETE ALL NOTIFICATIONS
export const deleteAllNotification = createAsyncThunk(
  'deleteAllNotification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.delete(`${EndPoint.DELETE_ALL_NOTIFICATIONS}`);
      if (response.status !== 200) {
        return rejectWithValue('Failed to send notification!');
      }
      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// COUNT NOTIFICATION
export const notificationCountApi = createAsyncThunk(
  'notificationCountApi',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.get(`${EndPoint.NOTIFICATION_COUNT}`);
      if (response.status !== 200) {
        return rejectWithValue('Failed to send notification!');
      }
      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// Slice to manage dropdown data
const notificationSlice = createSlice({
  name: "notificationSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FILE CLAIM
      .addCase(notificationListApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(notificationListApi.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(notificationListApi.rejected, (state, action) => {
        state.loading = false;
      })
      // READ SINGLE NOTIFICATION
      .addCase(readSingleNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(readSingleNotification.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(readSingleNotification.rejected, (state, action) => {
        state.loading = false;
      })

      // READ ALL NOTIFICATIONS
      .addCase(readAllNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(readAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(readAllNotifications.rejected, (state, action) => {
        state.loading = false;
      })

      // DELETE SINGLE 
      .addCase(deleteSingleNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSingleNotification.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteSingleNotification.rejected, (state, action) => {
        state.loading = false;
      })

      // DELETE ALL NOTIFICATIONS
      .addCase(deleteAllNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAllNotification.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteAllNotification.rejected, (state, action) => {
        state.loading = false;
      })

      // COUNT NOTIFICATION
      .addCase(notificationCountApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(notificationCountApi.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(notificationCountApi.rejected, (state, action) => {
        state.loading = false;
      })
      ;
  },
});

export default notificationSlice.reducer;
