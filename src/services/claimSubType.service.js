import instance from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION
// GET ALL CLAIM SUB TYPES
export const handleGetClaimSubType = async (params) => {
  return await instance.get(`/${API_VERSION}/claim-sub-types`, {
    params
  });
}

// CREATE NEW CLAIM SUB TYPE
export const createNewClaimSubType = async (data) => {
  return await instance.post(`/${API_VERSION}/claim-sub-types`, data);
}

// EDIT EXISTING CLAIM SUB TYPE
export const editClaimSubType = async (id, data) => {
  return await instance.put(`/${API_VERSION}/claim-sub-types/${id}`, data);
}

// GET CLAIM SUB TYPE BY ID
export const getClaimSubTypeById = async (id) => {
  return await instance.get(`/${API_VERSION}/claim-sub-types/${id}`);
}

// UPDATE CLAIM SUB TYPE STATUS
export const changeClaimSubTypeStatus = async (id, status) => {
  return await instance.patch(`/${API_VERSION}/claim-sub-types/${id}/status?status=${status}`);
}

// EXPORT CLAIM SUB TYPE LIST
export const downloadClaimSubTypes = async (params) => {
  return await instance.get(`/${API_VERSION}/claim-sub-types/download`, { params, responseType: 'arraybuffer' });
}

// CLAIM TYPE DROPDOWN LIST
export const claimTypesDropdownList = async () => {
  return await instance.get(`/${API_VERSION}/claim-types/dropdown-list`);
}