import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/axios';
import EndPoint from '../api/endpoint';

const initialState = {
    token: '',
    loading: false,
    error: null,
};

// LOGIN API
export const login = createAsyncThunk(
    'auth/login',
    async (values, { rejectWithValue }) => {
        try {
            const response = await authApi.post(EndPoint.LOGIN_API, values);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);
// NATIONAL ID VERIFY
export const nationalIdVerify = createAsyncThunk(
    'nationalIdVerify',
    async (nationalId, { rejectWithValue }) => {
        try {
            const response = await authApi.get(`${EndPoint.NATIONAL_ID_VERIFICATION}?identificacion=${nationalId}`);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)
// VALIDATE FINGERPRINT
export const fingerPrintValidate = createAsyncThunk(
    'fingerPrintValidate',
    async (values, { rejectWithValue }) => {
        try {
            const response = await authApi.post(`${EndPoint.INDIVIDUAL_PERSON_VALIDATE}`, values);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)
// SEND OTP ON EMAIL
export const sendOTPonEmail = createAsyncThunk(
    'sendOTPonEmail',
    async (values, { rejectWithValue }) => {
        try {
            const response = await authApi.post(`${EndPoint.SEND_OTP}`, values);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)
// AUTH SLICE
const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setLogout: (state) => {
            state.token = '';
        },
    },

    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.accessToken;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // NATIONAL ID VERIFICATION
            .addCase(nationalIdVerify.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(nationalIdVerify.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(nationalIdVerify.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // FINGERPRINT VERIFICATION 
            .addCase(fingerPrintValidate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fingerPrintValidate.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(fingerPrintValidate.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.errorDescription ?? action?.error?.message;
            })
            // SEND OTP ON EMAIL 
            .addCase(sendOTPonEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendOTPonEmail.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(sendOTPonEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.errorDescription ?? action?.error?.message;
            })
    },
});

export const { setLogout } = authSlice.actions;
export default authSlice.reducer;