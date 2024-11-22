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
      const response = await ticketsApi.post(`${EndPoint.FILE_CLAIM_SUBMIT}`,data);

      if (response.status !== 200) {
        return rejectWithValue('Failed to file claim!');
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
      });

  },
});

export default fileClaimSlice.reducer;
