import instance from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION
const port = process.env.REACT_APP_SEPS_USER_PORT

instance.defaults.baseURL = `${process.env.REACT_APP_API_URL}:${port}`;

export const handleAddUser = async (data) => {
    return await instance.post(`/api/${API_VERSION}/seps-users`, data);
}

export const handleGetUsers = async (params) => {
    return await instance.get(`/api/${API_VERSION}/seps-users`, {
        params
    });
}

export const handleGetUserById = async (id) => {
    return await instance.get(`/api/${API_VERSION}/seps-users/${id}`);
}



export const handleUpdateUser = async (id, data) => {
    return await instance.put(`/api/${API_VERSION}/seps-users/${id}`, data);
}

export const handleDeleteUser = async (id) => {
    return await instance.delete(`/api/${API_VERSION}/admin/users/${id}`);
}

export const handleStatusChangeState = async (id, status) => {
    // return await instance.put(`/api/${API_VERSION}/seps-users/${id}/status?active=${status}`, {});
    return await instance.patch(`/api/${API_VERSION}/seps-users/${id}/${status}`, {});
}



export const handleGetCompany = async (id) => {
    return await instance.get(`/api/${API_VERSION}/companies`);
}

export const handleGetUserCompany = async (id) => {
    return await instance.get(`/api/${API_VERSION}/user-companies`);
}

export const handleGetRole = async (id) => {
    return await instance.get(`/api/${API_VERSION}/roles/dropdown`);
}

export const handleUserResetPassword = async (id)=>{
    return await instance.get(`/api/${API_VERSION}/admin/users/reset-password/${id}`)
}

