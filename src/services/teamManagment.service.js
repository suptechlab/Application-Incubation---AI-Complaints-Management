import {adminApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION


export const getOrganizationList = async () => {
    return await adminApi.get(`/${API_VERSION}/organization/list`)
}

export const getTeamMemberList = async (entityType) => {
    return await adminApi.get(`/${API_VERSION}/teams/members/${entityType}`)
}

export const handleAddUser = async (data) => {
    return await adminApi.post(`/${API_VERSION}/teams`, data);
}

export const handleUpdateUser = async (id, data) => {
    return await adminApi.put(`/${API_VERSION}/teams/${id}`, data);
}

export const handleGetTableData = async (params) => {
    return await adminApi.get(`/${API_VERSION}/teams`, {
        params
    });
}


export const handleGetUserById = async (id) => {
    return await adminApi.get(`/${API_VERSION}/teams/${id}`);
}

export const handleDeleteUser = async (id) => {
    return await adminApi.delete(`/${API_VERSION}/teams/${id}`);
}

export const handleStatusChangeState = async (id, status) => {
    // return await instance.put(`/api/${API_VERSION}/seps-users/${id}/status?active=${status}`, {});
    return await adminApi.patch(`/${API_VERSION}/teams/${id}/${status}`, {});
}



