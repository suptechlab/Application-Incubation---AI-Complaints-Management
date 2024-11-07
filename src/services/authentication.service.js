import instance from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION
const port = process.env.REACT_APP_AUTH_PORT

// instance.defaults.baseURL=`${instance.defaults.baseURL}`
// instance.defaults.baseURL=`${instance.defaults.baseURL}:${port}/`
instance.defaults.baseURL = `${process.env.REACT_APP_API_URL}:${port}`;

export const handleChangePassword = async (data) => {
    return await instance.post(`/api/account/change-password`, data);
}

export const handleForgotPassword = async (data) => {
    return await instance.post(`/api/account/reset-password/init`, data);
}

export const handleLogin = async (data) => {
    return await instance.post(`/api/login`, data);
}

export const handleVerifyOtp = async (data) => {
    return await instance.post(`/api/verify-login-otp`, data);
}

export const handleLogout = async () => {
    return await instance.post(`/api/${API_VERSION}/auth/logout`);
}

export const handleResetPassword = async (data) => {
    return await instance.post(`/api/account/reset-password/finish`, data);
    // return await instance.post('/v1/account/reset-password/finish', { data }, {
    //     params: {
    //         token
    //     }
    // });
}

export const handleRefreshToken = async () => {
    return await instance.post(`/${API_VERSION}/refresh-token`, {
        refreshToken: JSON.parse(localStorage.getItem("refresh_token"))
    });
}

export const handleOtpVerify = async (data) => {
    return await instance.post(`/api/verify-otp`, data);
}

export const handleResendOTP = async (params) => {
    return await instance.get(`/api/resend-login-otp`, {params});
}

export const handleGetAccountDetail = async () => {
    return await instance.get(`/api/account`);
}

export const handleAccount = async (data) => {
    return await instance.post(`/api/account`, data);
}
