import instance from "../utils/instance";


// GET ALL PROVINCE MASTER
export const handleGetProvinceMaster = async (params) => {
  return await instance.get('/v1/province-master', {
    params
  });
}

// CREATE NEW PROVINCE MASTER
export const createNewProvinceMaster = async (data) => {
  return await instance.post('/v1/province-master', data);
}

// EDIT EXISTING PROVINCE MASTER
export const editInsuranceProvinceMaster = async (id, data) => {
  return await instance.put(`/v1/province-master/${id}`, data);
}

// GET PROVINCE MASTER BY ID
export const getProvinceMaster = async (id) => {
  return await instance.get(`/v1/province-master/${id}`);
}

// UPDATE PROVINCE MASTER STATUS
export const changeProvinceMaster = async (id, status) => {
  return await instance.put(`/v1/province-master/${id}?status=${status}`);
}

// EXPORT PROVINCE MASTER LIST
export const exportProvinceMasterList = async () => {
  return await instance.get('/v1/province-master', { params, responseType: 'arraybuffer' });
}