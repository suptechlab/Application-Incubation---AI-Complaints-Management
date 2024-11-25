import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import EndPoint from "../api/endpoint";
import { ticketsApi } from "../api/axios";

const initialState = {
  loading: false,
  error: null,
};
// SUBMIT FILE CLAIM FORM
export const fileClaimForm = createAsyncThunk(
  'fileClaimForm',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ticketsApi.post(`${EndPoint.FILE_CLAIM_SUBMIT}`, data);
      if (response.status !== 200) {
        return rejectWithValue('Failed to file claim!');
      }
      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// GET CLAIMS LIST
export const fileClaimList = createAsyncThunk(
  'fileClaimList',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ticketsApi.get(`${EndPoint.LIST_CLAIMS}`, { params });

      if (response.status !== 200) {
        return rejectWithValue('Failed to get claim list!');
      }

      return response?.data; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// GET CLAIMS DETAILS
export const getClaimTickets = createAsyncThunk(
  'getClaimTickets',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ticketsApi.get(`${EndPoint.CLAIM_TICKETS}/${id}`, );

      if (response.status !== 200) {
        return rejectWithValue('Failed to get claim list!');
      }

      return response; // RETURN RESPONSE
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// Slice to manage dropdown data
const fileClaimSlice = createSlice({
  name: "fileClaim",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FILE CLAIM
      .addCase(fileClaimForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fileClaimForm.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fileClaimForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // CLAIMS LIST
      .addCase(fileClaimList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fileClaimList.fulfilled, (state, action) => {

        console.log(action.payload)
        state.loading = false;
      })
      .addCase(fileClaimList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
       // CLAIM DETAILS
       .addCase(getClaimTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClaimTickets.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getClaimTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default fileClaimSlice.reducer;
