import {adminApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

// GET ALL CITY MASTER
export const handleGetCities = async (params) => {
  return await adminApi.get(`/${API_VERSION}/cities`, {
    params
  });
}

// CREATE NEW CITY MASTER
export const createNewCity = async (data) => {
  return await adminApi.post(`/${API_VERSION}/cities`, data);
}

// EDIT EXISTING CITY MASTER
export const editCity = async (id, data) => {
  return await adminApi.put(`/${API_VERSION}/cities/${id}`, data);
}

// GET CITY MASTER BY ID
export const getCitiesById = async (id) => {
  return await adminApi.get(`/${API_VERSION}/cities/${id}`);
}

// UPDATE CITY MASTER STATUS
export const changeCityStatus = async (id, status) => {
  return await adminApi.patch(`/${API_VERSION}/cities/${id}/status?status=${status}`);
}

// EXPORT CITY MASTER LIST
export const downloadCityList = async ({ params }) => {
  return await adminApi.get(`/${API_VERSION}/cities/download`, { params, responseType: 'arraybuffer' });
}

// GET PROVINCE DROPDOWN DATA 
export const provinceDropdownData = async () => {
  return await adminApi.get(`/${API_VERSION}/provinces/dropdown-list`);
}