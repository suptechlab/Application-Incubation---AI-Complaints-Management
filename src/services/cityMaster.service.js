import instance from "../utils/instance";

// GET ALL CITY MASTER
export const handleGetCities = async (params) => {
  return await instance.get('/v1/cities', {
    params
  });
}

// CREATE NEW CITY MASTER
export const createNewCity = async (data) => {
  return await instance.post('/v1/cities', data);
}

// EDIT EXISTING CITY MASTER
export const editCity = async (id, data) => {
  return await instance.put(`/v1/cities/${id}`, data);
}

// GET CITY MASTER BY ID
export const getCitiesById = async (id) => {
  return await instance.get(`/v1/cities/${id}`);
}

// UPDATE CITY MASTER STATUS
export const changeCityStatus = async (id, status) => {
  return await instance.patch(`/v1/cities/${id}/status?status=${status}`);
}

// EXPORT CITY MASTER LIST
export const downloadCityList = async ({ params }) => {
  return await instance.get('/v1/cities', { params, responseType: 'arraybuffer' });
}

// GET PROVINCE DROPDOWN DATA 
export const provinceDropdownData = async () => {
  return await instance.get('/v1/provinces/dropdown-list');
}