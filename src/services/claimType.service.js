import {adminApi} from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION
// GET ALL CLAIM TYPES
export const handleGetClaimTypes = async (params) => {
  return await adminApi.get(`/${API_VERSION}/claim-types`, {
    params
  });
}

// CREATE NEW CLAIM TYPE
export const createNewClaimType = async (data) => {
  return await adminApi.post(`/${API_VERSION}/claim-types`, data);
}

// EDIT EXISTING CLAIM TYPE
export const editClaimType = async (id,data) => {
  return await adminApi.put(`/${API_VERSION}/claim-types/${id}`,data);
}

// GET CLAIM TYPE BY ID
export const getClaimTypeById = async (id) => {
  return await adminApi.get(`/${API_VERSION}/claim-types/${id}`);
}

// UPDATE CLAIM TYPE STATUS
export const changeClaimTypeStatus = async (id,status) => {
  return await adminApi.patch(`/${API_VERSION}/claim-types/${id}/status?status=${status}`);
}

// EXPORT CLAIM TYPE LIST
export const downloadClaimTypes = async (params) => {
  return await adminApi.get(`/${API_VERSION}/claim-types/download`, { params, responseType: 'arraybuffer' });
}