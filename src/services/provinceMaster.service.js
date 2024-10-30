import instance from "../utils/instance";


// GET ALL PROVINCE MASTER
export const handleGetProvinceMaster = async (params) => {
  return await instance.get('/v1/provinces', {
    params
  });
}

// CREATE NEW PROVINCE MASTER
export const createNewProvinceMaster = async (data) => {
  return await instance.post('/v1/provinces', data);
}

// EDIT EXISTING PROVINCE MASTER
export const editInsuranceProvinceMaster = async (id, data) => {
  return await instance.put(`/v1/provinces/${id}`, data);
}

// GET PROVINCE MASTER BY ID
export const getProvinceMaster = async (id) => {
  return await instance.get(`/v1/provinces/${id}`);
}

// UPDATE PROVINCE MASTER STATUS
export const changeProvinceMaster = async (id, status) => {
  return await instance.patch(`/v1/provinces/${id}/status?status=${status}`);
}

// EXPORT PROVINCE MASTER LIST
export const exportProvinceMasterList = async (params) => {
  return await instance.get('/v1/provinces', { params, responseType: 'arraybuffer' });
}