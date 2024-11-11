import {adminApi} from "../utils/instance";

export const handleGetRoleRights = async (params) => {
    return await adminApi.get('/v1/roles', {
        params
    });
}

export const handleDeleteRoleRight = async (id) => {
    return await adminApi.delete(`/v1/roles/${id}`);
}

export const handleGetRoleRightById = async (id) => {
    return await adminApi.get(`/v1/roles/${id}`);
}

export const handleAddRoleRight = async (data) => {
    return await adminApi.post('/v1/roles', data);
}

export const handleEditRoleRight = async (id, data) => {
    data.id = id;
    return await adminApi.put(`/v1/roles`, data);
}

export const fetchModulesAndPermissions = async () => {
    return await adminApi.get('/v1/roles/modules-permissions');
}
