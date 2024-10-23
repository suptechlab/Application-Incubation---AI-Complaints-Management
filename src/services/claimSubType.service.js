import instance from "../utils/instance";


// GET ALL CLAIM SUB TYPES
export const handleGetClaimSubType = async (params) => {
  return await instance.get('/v1/claim-sub-type', {
    params
  });
}

// CREATE NEW CLAIM SUB TYPE
export const createNewClaimSubType = async (data) => {
  return await instance.post('/v1/claim-sub-type', data);
}

// EDIT EXISTING CLAIM SUB TYPE
export const editClaimSubType = async (id, data) => {
  return await instance.put(`/v1/claim-sub-type/${id}`, data);
}

// GET CLAIM SUB TYPE BY ID
export const getClaimSubTypeById = async (id) => {
  return await instance.get(`/v1/claim-sub-type/${id}`);
}

// UPDATE CLAIM SUB TYPE STATUS
export const changeClaimSubTypeStatus = async (id, status) => {
  return await instance.put(`/v1/claim-sub-type/${id}?status=${status}`);
}

// EXPORT CLAIM SUB TYPE LIST
export const exportClaimSubTypes = async (params) => {
  return await instance.get('/v1/claim-sub-type', { params, responseType: 'arraybuffer' });
}