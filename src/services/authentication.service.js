import {authApi} from "../utils/instance";

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
    return await authApi.post('/v1/refresh-token', {
        refreshToken: JSON.parse(localStorage.getItem("refresh_token"))
    });
}

export const handleOtpVerify = async (data) => {
    return await authApi.post('/v1/verify-otp', data);
}

export const handleResendOTP = async (params) => {
    return await authApi.get('/resend-login-otp', {params});
}

export const handleGetAccountDetail = async () => {
    return await authApi.get(`/account`);
}

export const handleAccount = async (data) => {
    return await authApi.post('/account', data);
}
