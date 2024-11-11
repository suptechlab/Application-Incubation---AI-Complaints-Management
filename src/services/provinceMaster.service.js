import {adminApi} from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION
// GET ALL PROVINCE MASTER
export const handleGetProvinceMaster = async (params) => {
  return await adminApi.get(`/${API_VERSION}/provinces`, {
    params
  });
}

// CREATE NEW PROVINCE MASTER
export const createNewProvinceMaster = async (data) => {
  return await adminApi.post(`/${API_VERSION}/provinces`, data);
}

// EDIT EXISTING PROVINCE MASTER
export const editProvinceMaster = async (id, data) => {
  return await adminApi.put(`/${API_VERSION}/provinces/${id}`, data);
}

// GET PROVINCE MASTER BY ID
export const getProvinceMaster = async (id) => {
  return await adminApi.get(`/${API_VERSION}/provinces/${id}`);
}

// UPDATE PROVINCE MASTER STATUS
export const changeProvinceMasterStatus = async (id, status) => {
  return await adminApi.patch(`/${API_VERSION}/provinces/${id}/status?status=${status}`);
}

// EXPORT PROVINCE MASTER LIST
export const downloadProvinceMasterList = async (params) => {
  return await adminApi.get(`/${API_VERSION}/provinces/download`, { params, responseType: 'arraybuffer' });
}