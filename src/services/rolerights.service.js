import instance from "../utils/instance";

export const handleGetRoleRights = async (params) => {
    return await instance.get('/v1/roles', {
        params
    });
}

export const handleDeleteRoleRight = async (id) => {
    return await instance.delete(`/v1/roles/${id}`);
}

export const handleGetRoleRightById = async (id) => {
    return await instance.get(`/v1/roles/${id}`);
}

export const handleAddRoleRight = async (data) => {
    return await instance.post('/v1/roles', data);
}

export const handleEditRoleRight = async (id, data) => {
    data.id = id;
    return await instance.put(`/v1/roles`, data);
}

export const fetchModulesAndPermissions = async () => {
    return await instance.get('/v1/roles/modules-permissions');
}
