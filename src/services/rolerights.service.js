import instance from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION
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

// GET ROLES DROPDOWN DATA WITH USER TYPE
export const getRolesDropdownData = async (userType) =>{
    return await instance.get(`/${API_VERSION}/roles/dropdown/${userType}`);
}