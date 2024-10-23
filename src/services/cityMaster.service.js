import instance from "../utils/instance";

// GET ALL CITY MASTER
export const handleGetCityMaster = async (params) => {
  return await instance.get('/v1/city-master', {
    params
  });
}

// CREATE NEW CITY MASTER
export const createNewCityMaster = async (data) => {
  return await instance.post('/v1/city-master', data);
}

// EDIT EXISTING CITY MASTER
export const editCityMaster = async (id, data) => {
  return await instance.put(`/v1/city-master/${id}`, data);
}

// GET CITY MASTER BY ID
export const getCityMaster = async (id) => {
  return await instance.get(`/v1/city-master/${id}`);
}

// UPDATE CITY MASTER STATUS
export const changeCityMaster = async (id, status) => {
  return await instance.put(`/v1/city-master/${id}?status=${status}`);
}

// EXPORT CITY MASTER LIST
export const exportCityMasterList = async () => {
  return await instance.get('/v1/city-master', { params, responseType: 'arraybuffer' });
}