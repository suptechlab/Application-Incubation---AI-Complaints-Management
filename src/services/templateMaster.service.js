import instance from "../utils/instance";

// GET ALL TEMPLATE MASTER
export const handleGetTemplateMaster = async (params) => {
  return await instance.get('/v1/template-master', {
    params
  });
}

// CREATE NEW TEMPLATE MASTER
export const createNewTemplateMaster = async (data) => {
  return await instance.post('/v1/template-master', data);
}

// EDIT EXISTING TEMPLATE MASTER
export const editTemplateMaster = async (id, data) => {
  return await instance.put(`/v1/template-master/${id}`, data);
}

// GET TEMPLATE MASTER BY ID
export const getTemplateMaster = async (id) => {
  return await instance.get(`/v1/template-master/${id}`);
}

// UPDATE TEMPLATE MASTER STATUS
export const changeTemplateMaster = async (id, status) => {
  return await instance.put(`/v1/template-master/${id}?status=${status}`);
}

// EXPORT TEMPLATE MASTER LIST
export const exportTemplateMasterList = async () => {
  return await instance.get('/v1/template-master', { params, responseType: 'arraybuffer' });
}