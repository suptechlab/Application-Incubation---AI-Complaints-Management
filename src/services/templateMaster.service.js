import {adminApi} from "../utils/instance";

// GET ALL TEMPLATE MASTER
export const handleGetTemplateMaster = async (params) => {
  return await adminApi.get('/v1/templates', {
    params
  });
}

// CREATE NEW TEMPLATE MASTER
export const createNewTemplateMaster = async (data) => {
  return await adminApi.post('/v1/templates', data);
}

// EDIT EXISTING TEMPLATE MASTER
export const editTemplateMaster = async (id, data) => {
  return await adminApi.put(`/v1/templates/${id}`, data);
}

// GET TEMPLATE MASTER BY ID
export const getTemplateMaster = async (id) => {
  return await adminApi.get(`/v1/templates/${id}`);
}

// UPDATE TEMPLATE MASTER STATUS
export const changeTemplateMaster = async (id, status) => {
  console.log('currentStatus',status.status)
  return await adminApi.patch(`/v1/templates/${id}/status?status=${status.status}`);
}

// EXPORT TEMPLATE MASTER LIST
export const downloadTemplateList = async ({params}) => {
  return await adminApi.get(`/v1/templates/download`, { params, responseType: 'arraybuffer' });
}

