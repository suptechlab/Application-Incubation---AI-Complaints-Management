import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi, userApi } from '../api/axios';
import EndPoint from '../api/endpoint';
import { removeLocalStorage, setLocalStorage } from '../../utils/storage';

const initialState = {
    token: null,
    loading: false,
    error: null,
    user: {},
    isLoggedIn: false
};
// NATIONAL ID VERIFICATION STATUS
export const nationalIDVerificationStatus = createAsyncThunk(
    'nationalIDVerificationStatus',
    async (nationalId, { rejectWithValue }) => {
        try {
            const response = await authApi.get(`${EndPoint.NATIONAL_ID_VERIFICATION_STATUS}?identificacion=${nationalId}`);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

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

//SEND LOGIN OTP ON EMAIL
export const sendLoginOTPonEmail = createAsyncThunk(
    'sendLoginOTPonEmail',
    async (values, { rejectWithValue }) => {
        try {
            const response = await authApi.post(`${EndPoint.SEND_LOGIN_OTP}`, values);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)
// VERIFY LOGIN OTP 
export const verifyLoginOTP = createAsyncThunk(
    'verifyLoginOTP',
    async (values, { rejectWithValue, dispatch }) => {
        try {
            const response = await authApi.post(`${EndPoint.VERIFY_LOGIN_OTP}`, values);

            const { id_token } = response.data;

            // Step 2: Save the id_token to localStorage
            setLocalStorage('id_token', id_token);

            // Step 3: Fetch account info using the stored token
            const accountResponse = await dispatch(getAccountInfo());

            return {
                id_token: id_token,
                accountData: accountResponse.payload
            };

        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

//RESEND LOGIN OTP ON EMAIL
export const resendLoginOTPonEmail = createAsyncThunk(
    'resendLoginOTPonEmail',
    async (token, { rejectWithValue }) => {
        try {
            const response = await authApi.get(`${EndPoint.RESEND_LOGIN_OTP}?otpToken=${token}`);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

// SEND REGISTER OTP ON EMAIL
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
// VERIFY OTP 
export const verifyRegisterOTP = createAsyncThunk(
    'verifyRegisterOTP',
    async (values, { rejectWithValue }) => {
        try {
            const response = await authApi.post(`${EndPoint.VERIFY_OTP}`, values);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)


// REGISTER USER AND FETCH ACCOUNT INFO
export const registerUser = createAsyncThunk(
    'registerUser',
    async (values, { rejectWithValue, dispatch }) => {
        try {
            // Step 1: Register the user
            // const registerResponse = await authApi.post(EndPoint.REGISTER_API, values);

            // Extract the id_token
            // const { id_token } = registerResponse.data;

            const id_token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huQHlvcG1haWwuY29tIiwiZXhwIjoxNzM0NTE4MTc5LCJhdXRoIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzMxOTI2MTc5fQ.0SpNU-4fkn-lGqKzvyQB_6QHOHjhJTW1mWwyXVCN0uf-522GLVcNrG7izfI9rzxRNhatI3R-LFe1kodjZFtaeQ"

            // Step 2: Save the id_token to localStorage
            setLocalStorage('id_token', id_token);

            // Step 3: Fetch account info using the stored token
            const accountResponse = await dispatch(getAccountInfo());

            return {
                id_token: id_token,
                accountData: accountResponse.payload
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// GET ACCOUNT OF LOGGED IN USER
export const getAccountInfo = createAsyncThunk(
    'getAccountInfo',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userApi.get(EndPoint.ACCOUNT_API);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
// AUTH SLICE
const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setLogout: (state) => {
            state.token = null;
            state.user = {};
            state.isLoggedIn = false
            removeLocalStorage('id_token');
        }
    },

    extraReducers: (builder) => {
        builder
            // ACCOUNT INFO
            .addCase(getAccountInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAccountInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getAccountInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            //NATIONAL ID VERIFICATION STATUS 
            .addCase(nationalIDVerificationStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(nationalIDVerificationStatus.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(nationalIDVerificationStatus.rejected, (state, action) => {
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
            // VERIFY OTP ON EMAIL 
            .addCase(verifyRegisterOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyRegisterOTP.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(verifyRegisterOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.errorDescription ?? action?.error?.message;
            })
            // REGISTER API
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true
                state.token = action.payload.id_token
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.errorDescription ?? action?.error?.message;
            })
            // SEND LOGIN OTP ON EMAIL
            .addCase(sendLoginOTPonEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendLoginOTPonEmail.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(sendLoginOTPonEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.errorDescription ?? action?.error?.message;
            })

            // VERIFY LOGIN OTP 
            .addCase(verifyLoginOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyLoginOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true
                state.token = action.payload.id_token
            })
            .addCase(verifyLoginOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.errorDescription ?? action?.error?.message;
            })

            // RESEND LOGIN OTP 
            .addCase(resendLoginOTPonEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resendLoginOTPonEmail.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(resendLoginOTPonEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action?.error?.errorDescription ?? action?.error?.message;
            })
    },
});

export const { setLogout } = authSlice.actions;
export default authSlice.reducer;