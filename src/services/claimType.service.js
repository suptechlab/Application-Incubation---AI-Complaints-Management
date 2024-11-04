import instance from "../utils/instance";

// GET ALL CLAIM TYPES
export const handleGetClaimTypes = async (params) => {
  return await instance.get('/v1/claim-types', {
    params
  });
}

// CREATE NEW CLAIM TYPE
export const createNewClaimType = async (data) => {
  return await instance.post('/v1/claim-types', data);
}

// EDIT EXISTING CLAIM TYPE
export const editClaimType = async (id,data) => {
  return await instance.put(`/v1/claim-types/${id}`,data);
}

// GET CLAIM TYPE BY ID
export const getClaimTypeById = async (id) => {
  return await instance.get(`/v1/claim-types/${id}`);
}

// UPDATE CLAIM TYPE STATUS
export const changeClaimTypeStatus = async (id,status) => {
  return await instance.patch(`/v1/claim-types/${id}/status?status=${status}`);
}

// EXPORT CLAIM TYPE LIST
export const downloadClaimTypes = async (params) => {
  return await instance.get('/v1/claim-types/download', { params, responseType: 'arraybuffer' });
}