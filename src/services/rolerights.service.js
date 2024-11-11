import instance from "../utils/instance";


const API_VERSION = process.env.REACT_APP_API_VERSION
const port = process.env.REACT_APP_SEPS_USER_PORT

instance.defaults.baseURL = `${process.env.REACT_APP_API_URL}:${port}`;

export const handleGetRoleRights = async (params) => {
    return await instance.get(`/api/${API_VERSION}/roles`, {
        params
    });
}

export const handleDeleteRoleRight = async (id) => {
    return await instance.delete(`/api/${API_VERSION}/${id}`);
}

export const handleGetRoleRightById = async (id) => {
    return await instance.get(`/api/${API_VERSION}/roles/${id}`);
}

export const handleAddRoleRight = async (data) => {
    return await instance.post(`/api/${API_VERSION}/roles`, data);
}

export const handleEditRoleRight = async (id, data) => {
    // data.id = id;
    return await instance.put(`/api/${API_VERSION}/roles/${id}`, data);
}

export const fetchModulesAndPermissions = async (userType) => {
    return await instance.get(`/api/${API_VERSION}/roles/modules-permissions/${userType}`);
}
