import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { userApi } from '../api/axios';
import EndPoint from '../api/endpoint';

const initialState = {
    token: '',
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (values) => {
        try {
            const response = await userApi.post(EndPoint.LOGIN_API, values);
            return response.data;
        } catch (error) {
            return error;
        }
    }
);

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
    },
});

export const { setLogout } = authSlice.actions;
export default authSlice.reducer;