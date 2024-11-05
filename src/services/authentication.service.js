import instance from "../utils/instance";

export const handleChangePassword = async (data) => {
    return await instance.post('/v1/auth/change-password', data);
}

export const handleForgotPassword = async (data) => {
    return await instance.post('/account/reset-password/init', data);
}

export const handleLogin = async (data) => {
    return await instance.post('/login', data);
}

export const handleVerifyOtp = async (data) => {
    return await instance.post('/verify-login-otp', data);
}

export const handleLogout = async () => {
    return await instance.post('/v1/auth/logout');
}

export const handleResetPassword = async (data) => {
    return await instance.post('/account/reset-password/finish', data);
    // return await instance.post('/v1/account/reset-password/finish', { data }, {
    //     params: {
    //         token
    //     }
    // });
}

export const handleRefreshToken = async () => {
    return await instance.post('/v1/refresh-token', {
        refreshToken: JSON.parse(localStorage.getItem("refresh_token"))
    });
}

export const handleOtpVerify = async (data) => {
    return await instance.post('/v1/verify-otp', data);
}

export const handleResendOTP = async (params) => {
    return await instance.get('/resend-login-otp', {params});
}

export const handleGetAccountDetail = async () => {
    return await instance.get(`/account`);
}

