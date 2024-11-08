import instance from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION


// GET PERSONAL INFO BY IDENTIFICATION
export const getPersonalInfo = async (identification) => {
  return await instance.get(`/${API_VERSION}/fi-users/person-info?identification=${identification}`);
}

// GET ORGANIZATION INFO BY TAX ID
export const getOrganizationInfo = async (identification) => {
  return await instance.get(`/${API_VERSION}/organization/info?ruc=${identification}`);
  // 1790866084001
}

// GET FI USERS LIST
export const handleGetFIusersList = async (params) => {
  return await instance.get(`/${API_VERSION}/fi-users`, {
    params
  });
}

// GET FI USER BY ID
export const handleGetFIuserById = async (data,id) => {
  return await instance.get(`/${API_VERSION}/fi-users/${id}`, data);
}


// HANDLE ADD FI USERS
export const handleAddFIUsers = async (data) => {
  return await instance.post(`/${API_VERSION}/fi-users`, data);
}

// HANDLE EDIT FI USERS
export const handleEditFIUsers = async (id, data) => {
  return await instance.put(`/${API_VERSION}/fi-users/${id}`, data);
}