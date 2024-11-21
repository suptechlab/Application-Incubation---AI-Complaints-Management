import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import EndPoint from "../api/endpoint";
import { userApi } from "../api/axios";

const initialState = {
  customer_types: [],
  priority_care_group: [],
  claim_types: [],
  loading: false,
  error: null,
};

// HELPER FUNCTION TO FORMAT GENERAL DATA FOR DROPDOWN
const formatGeneralData = (data) =>
  Object.entries(data).map(([key, value]) => ({ label: value, value: key }));

// HELPER FUNCTION TO FORMAT CLAM DATA FOR DROPDOWN
const formatClaimData = (data) =>
  data.map((item) => ({ label: item.name, value: item.id }));

// Async Thunk to fetch and format all dropdown data
export const fetchMasterData = createAsyncThunk(
  "masterDropdownData/fetchMasterData",
  async (_, { rejectWithValue }) => {
    try {
      const responses = await Promise.all([
        userApi.get(EndPoint.MASTER_DATA_API), // Customer types and priority care groups
        userApi.get(EndPoint.MASTER_CLAIM_TYPE_LIST), // Claim types
        // userApi.post(EndPoint.MASTER_CLAIM_SUB_TYPE_LIST), // Claim sub-types
      ]);

      const [masterDataResponse, claimTypesResponse] = responses;

      return {
        customer_types: formatGeneralData(masterDataResponse.data.customerType),
        priority_care_group: formatGeneralData(masterDataResponse.data.priorityCareGroup),
        claim_types: formatClaimData(claimTypesResponse.data),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch master data"
      );
    }
  }
);

// FETCH CLAIM SUB TYPES
export const fetchClaimSubTypes = createAsyncThunk(
  'masterDropdownData/fetchClaimSubTypes',
  async (claimTypeId, { rejectWithValue }) => {
    try {
      const response = await userApi.get(`${EndPoint.MASTER_CLAIM_SUB_TYPE_LIST}/${claimTypeId}`,);

      if (response.status !== 200) {
        return rejectWithValue('Failed to fetch claim sub-types');
      }

      return response.data.map((item) => ({
        label: item.name,
        value: item.id,
      })); // Format the response to [{label, value},...]
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
// Slice to manage dropdown data
const masterSlice = createSlice({
  name: "masterDropdownData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.loading = false;
        state.customer_types = action.payload.customer_types;
        state.priority_care_group = action.payload.priority_care_group;
        state.claim_types = action.payload.claim_types;
        state.claim_sub_types = action.payload.claim_sub_types;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });

    // EXTRA REDUCER FOR CLAIM SUB TYPES
    builder
      .addCase(fetchClaimSubTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClaimSubTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.claim_sub_types = action.payload;
      })
      .addCase(fetchClaimSubTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default masterSlice.reducer;
