import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import EndPoint from "../api/endpoint";
import { userApi } from "../api/axios";

const initialState = {
  customer_types: [],
  priority_care_group: [],
  claim_types: [],
  province_list: [],
  city_list: [],
  organizational_units: [],
  instance_types: [],
  loading: false,
  error: null,
  masterData : {}
};

// HELPER FUNCTION TO FORMAT GENERAL DATA FOR DROPDOWN
const formatGeneralData = (data) =>
  Object.entries(data).map(([key, value]) => ({ label: value, value: key }));

// HELPER FUNCTION TO FORMAT CLAM DATA FOR DROPDOWN
const formatListData = (data) =>
  data.map((item) => ({ label: item.name, value: item.id }));

// HELPER FUNCTION TO FORMAT CLAM DATA FOR DROPDOWN
const formatOrganizationalUnits = (data) =>
  data.map((item) => ({ label: item.razonSocial, value: item.id , ruc : item.ruc }));

// Async Thunk to fetch and format all dropdown data
export const fetchMasterData = createAsyncThunk(
  "masterDropdownData/fetchMasterData",
  async (_, { rejectWithValue }) => {
    try {
      const responses = await Promise.all([
        userApi.get(EndPoint.MASTER_DATA_API), // Customer types and priority care groups
        userApi.get(EndPoint.MASTER_CLAIM_TYPE_LIST), // Claim types
        userApi.get(EndPoint.MASTER_ORGANIZATIONAL_UNIT), // Organizational unit
        userApi.get(EndPoint.MASTER_PROVINCE_LIST), // Province list
      ]);

      const [
        masterDataResponse,
        claimTypesResponse,
        organizationalUnitResponse,
        provinceListResponse,
      ] = responses;

      return {
        masterData : masterDataResponse?.data ,
        customer_types: formatGeneralData(masterDataResponse.data.customerType),
        priority_care_group: formatGeneralData(masterDataResponse.data.priorityCareGroup),
        claim_types: formatListData(claimTypesResponse.data),
        organizational_units: formatOrganizationalUnits(organizationalUnitResponse.data),
        province_list: formatListData(provinceListResponse.data),
        instance_types: formatGeneralData(masterDataResponse.data.instanceType)
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

// FETCH CITY LIST
export const fetchCityList = createAsyncThunk(
  'masterDropdownData/fetchCityList',
  async (provinceId, { rejectWithValue }) => {
    try {
      const response = await userApi.get(`${EndPoint.MASTER_CITY_LIST}/${provinceId}`,);

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
        state.province_list = action.payload.province_list;
        state.organizational_units = action.payload.organizational_units;
        state.instance_types = action.payload.instance_types;
        state.masterData = action.payload.masterData
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
        // state.claim_sub_types = action.payload;
      })
      .addCase(fetchClaimSubTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // FETCH CITY LIST
    builder
      .addCase(fetchCityList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCityList.fulfilled, (state, action) => {
        state.loading = false;
        // state.claim_sub_types = action.payload;
      })
      .addCase(fetchCityList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default masterSlice.reducer;
