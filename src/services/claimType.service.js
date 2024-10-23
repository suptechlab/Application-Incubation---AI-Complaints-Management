import instance from "../utils/instance";

// GET ALL CLAIM TYPES
export const handleGetClaimType = async (params) => {
  return await instance.get('/v1/claim-type', {
    params
  });
}

// CREATE NEW CLAIM TYPE
export const createNewClaimType = async (data) => {
  return await instance.post('/v1/claim-type', data);
}

// EDIT EXISTING CLAIM TYPE
export const editClaimType = async (id,data) => {
  return await instance.put(`/v1/claim-type/${id}`,data);
}

// GET CLAIM TYPE BY ID
export const getClaimTypeById = async (id) => {
  return await instance.get(`/v1/claim-type/${id}`);
}

// UPDATE CLAIM TYPE STATUS
export const changeClaimTypeStatus = async (id,status) => {
  return await instance.put(`/v1/claim-type/${id}?status=${status}`);
}

// EXPORT CLAIM TYPE LIST
export const exportClaimSubTypes = async (params) => {
  return await instance.get('/v1/claim-type', { params, responseType: 'arraybuffer' });
}