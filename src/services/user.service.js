import instance from "../utils/instance";

export const handleGetUsers = async (params) => {
    return await instance.get('/v1/claim-sub-types', {
        params
    });
}

export const handleGetUser = async (id) => {
    return await instance.get(`/v1/users/${id}`);
}

export const handleUpdateUser = async (id, data) => {
    // return await instance.put(`/v1/admin/users/${id}`, data);
    return await instance.put(`/v1/admin/users`, data);
}

export const handleDeleteUser = async (id) => {
    return await instance.delete(`/v1/admin/users/${id}`);
}

export const handleStatusChangeState = async (id, status) => {
    return await instance.put(`/v1/admin/users/${id}/status?active=${status}`, {});
}

export const handleGetUserById = async (id) => {
    return await instance.get(`/v1/admin/users/${id}`);
}

export const handleAddUser = async (data) => {
    return await instance.post('/v1/admin/users', data);
}

export const handleGetCompany = async (id) => {
    return await instance.get(`/v1/companies`);
}

export const handleGetUserCompany = async (id) => {
    return await instance.get(`/v1/user-companies`);
}

export const handleGetRole = async (id) => {
    return await instance.get(`/v1/roles/dropdown`);
}


export const handleUserResetPassword = async (id)=>{
    return await instance.get(`/v1/admin/users/reset-password/${id}`)
}

