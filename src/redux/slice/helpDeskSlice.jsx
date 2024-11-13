import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import EndPoint from "../api/endpoint";
import { userApi } from "../api/axios";

const initialState = {
    chatBotVisible: false,
    isAgree: false,
    loading: false,
    error: null,
    queryLoading: false,
    queryError: null,
    querySuccess: false,
    apiResponse: {},
    chatData : []
};

// DPA ACCEPTANCE 
export const dpaAcceptance = createAsyncThunk(
    'dpaAcceptance',
    async (value, { rejectWithValue }) => {
        try {
            const response = await userApi.post(`${EndPoint.DPA_ACCEPT}?status=${value}`);
            if (response.status === 401) {
                return rejectWithValue('Unauthorized access.');
            }
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue('Unauthorized access.');
            }
            return rejectWithValue(error.message || 'Something went wrong');
        }
    }
);

// Async Thunk for sending an enquiry
export const sendQuery = createAsyncThunk(
    'sendQuery',
    async (queryData, { rejectWithValue }) => {
        try {
            const response = await userApi.post(EndPoint.SEND_QUERY, queryData);

            // Check if the response has any errors
            if (response.status === 401) {
                return rejectWithValue('Unauthorized access');
            }
            if (response.status !== 200) {
                return rejectWithValue('Failed to send enquiry');
            }

            return response.data;
        } catch (error) {
            // Handle specific error responses if needed
            if (error.response?.status === 401) {
                return rejectWithValue('Unauthorized access');
            }
            return rejectWithValue(error.message || 'Something went wrong');
        }
    }
);


// SLICE FOR HELP DESK
const helpDeskSlice = createSlice({
    name: 'helpDeskChatBot',
    initialState,
    reducers: {
        toggleChatbot: (state) => {
            state.chatBotVisible = !state.chatBotVisible;
        },
        resetQueryState: (state) => {
            state.queryLoading = false;
            state.querySuccess = false;
            state.queryError = null;
        }
    },
    extraReducers: (builder) => {
        // DPA ACCEPTANCE
        builder
            .addCase(dpaAcceptance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(dpaAcceptance.fulfilled, (state, action) => {
                state.loading = false;
                if (action?.payload?.status === 200) {
                    state.isAgree = true;
                }
            })
            .addCase(dpaAcceptance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Send Enquiry API
            .addCase(sendQuery.pending, (state) => {
                state.queryLoading = true;
                state.queryError = null;
                state.querySuccess = false;
            })
            .addCase(sendQuery.fulfilled, (state, action) => {
                state.queryLoading = false;
                state.apiResponse = action?.payload
            })
            .addCase(sendQuery.rejected, (state, action) => {
                state.queryLoading = false;
                state.queryError = action.payload || action.error.message;
            });
    },
});

export const { toggleChatbot } = helpDeskSlice.actions;

export default helpDeskSlice.reducer;