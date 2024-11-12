import {adminApi} from "../utils/instance";


const API_VERSION = process.env.REACT_APP_API_VERSION
// const port = process.env.REACT_APP_SEPS_USER_PORT

// instance.defaults.baseURL = `${process.env.REACT_APP_API_URL}:${port}`;

export const handleGetRoleRights = async (params) => {
    return await adminApi.get(`/${API_VERSION}/roles`, {
        params
    });
}

export const handleDeleteRoleRight = async (id) => {
    return await adminApi.delete(`/${API_VERSION}/${id}`);
}

export const handleGetRoleRightById = async (id) => {
    return await adminApi.get(`/${API_VERSION}/roles/${id}`);
}

export const handleAddRoleRight = async (data) => {
    return await adminApi.post(`/${API_VERSION}/roles`, data);
}

export const handleEditRoleRight = async (id, data) => {
    // data.id = id;
    return await adminApi.put(`/${API_VERSION}/roles/${id}`, data);
}

export const fetchModulesAndPermissions = async (userType) => {
    return await adminApi.get(`/${API_VERSION}/roles/modules-permissions/${userType}`);
}

// GET ROLES DROPDOWN DATA WITH USER TYPE
export const getRolesDropdownData = async (userType) =>{
    return await instance.get(`/${API_VERSION}/roles/dropdown/${userType}`);
}