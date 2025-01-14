import {adminApi}  from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION


// GET PERSONAL INFO BY IDENTIFICATION
export const getPersonalInfo = async (identification) => {
  return await adminApi.get(`/${API_VERSION}/fi-users/person-info?identificacion=${identification}`);
}

// GET ORGANIZATION INFO BY TAX ID
export const getOrganizationInfo = async (identification) => {
  return await adminApi.get(`/${API_VERSION}/organization/info?ruc=${identification}`);
  // 1790866084001
}

// GET FI USERS LIST
export const handleGetFIusersList = async (params) => {
  return await adminApi.get(`/${API_VERSION}/fi-users`, {
    params
  });
}

// GET FI USER BY ID
export const handleGetFIuserById = async (id) => {
  return await adminApi.get(`/${API_VERSION}/fi-users/${id}`);
}


// HANDLE ADD FI USERS
export const handleAddFIUsers = async (data) => {
  return await adminApi.post(`/${API_VERSION}/fi-users`, data);
}

// HANDLE EDIT FI USERS
export const handleEditFIUsers = async (id, data) => {
  return await adminApi.put(`/${API_VERSION}/fi-users/${id}`, data);
}
// HANDLE FI USER STATUS CHANGE 
export const handleFIUsersStatusChange = async (id, status) => {
  return await adminApi.patch(`/${API_VERSION}/fi-users/${id}/${status}`);
}
// IMPORT FI USERS API 
export const handleImportFiUsersApi = async (data)=>{
  return await adminApi.post(`/${API_VERSION}/fi-users/import`,data);
}