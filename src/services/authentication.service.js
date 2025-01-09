import {adminApi, authApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

export const handleChangePassword = async (data) => {
    return await authApi.post('/account/change-password', data);
}

export const handleForgotPassword = async (data) => {
    return await authApi.post('/account/reset-password/init', data);
}

export const handleLogin = async (data) => {
    return await authApi.post('/login', data);
}

export const handleVerifyOtp = async (data) => {
    return await authApi.post('/verify-login-otp', data);
}

export const handleLogout = async () => {
    return await authApi.post('/v1/auth/logout');
}

export const handleResetPassword = async (data) => {
    return await authApi.post('/account/reset-password/finish', data);
    // return await authApi.post('/v1/account/reset-password/finish', { data }, {
    //     params: {
    //         token
    //     }
    // });
}

export const handleRefreshToken = async () => {
    return await authApi.post(`/${API_VERSION}/refresh-token`, {
        refreshToken: JSON.parse(localStorage.getItem("refresh_token"))
    });
}

export const handleResendOTP = async (params) => {
    return await authApi.get(`/resend-login-otp`, {params});
}

export const handleGetAccountDetail = async () => {
    return await authApi.get(`/account`);
}

// DOWNLOAD PROFILE IMAGE
export const downloadProfileImage = async () => {
    return await adminApi.get(`/${API_VERSION}/account/download-profile-picture`, {
        responseType: 'blob', // Ensures the response is treated as a file
    });
}

// UPDATE ACCOUNT
export const handleAccount = async (data) => {
    return await adminApi.post(`/${API_VERSION}/account`, data);
}