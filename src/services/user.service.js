import {adminApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION
// const port = process.env.REACT_APP_SEPS_USER_PORT

// instance.defaults.baseURL = `${process.env.REACT_APP_API_URL}:${port}`;

export const handleAddUser = async (data) => {
    return await adminApi.post(`/${API_VERSION}/seps-users`, data);
}

export const handleGetUsers = async (params) => {
    return await adminApi.get(`/${API_VERSION}/seps-users`, {
        params
    });
}

export const handleGetUserById = async (id) => {
    return await adminApi.get(`/${API_VERSION}/seps-users/${id}`);
}

export const handleUpdateUser = async (id, data) => {
    return await adminApi.put(`/${API_VERSION}/seps-users/${id}`, data);
}

export const handleDeleteUser = async (id) => {
    return await adminApi.delete(`/${API_VERSION}/admin/users/${id}`);
}

export const handleStatusChangeState = async (id, status) => {
    // return await instance.put(`/api/${API_VERSION}/seps-users/${id}/status?active=${status}`, {});
    return await adminApi.patch(`/${API_VERSION}/seps-users/${id}/${status}`, {});
}

export const handleSEPSUserVerification = async (data) => {
    return await adminApi.post(`/${API_VERSION}/seps-users/verify`, data);
}

export const handleGetCompany = async (id) => {
    return await adminApi.get(`/${API_VERSION}/companies`);
}

export const handleGetUserCompany = async (id) => {
    return await adminApi.get(`/${API_VERSION}/user-companies`);
}

export const handleGetRole = async (userType) => {
    return await adminApi.get(`/${API_VERSION}/roles/dropdown/${userType}`);
}

export const handleUserResetPassword = async (id)=>{
    return await adminApi.get(`/${API_VERSION}/admin/users/reset-password/${id}`)
}

