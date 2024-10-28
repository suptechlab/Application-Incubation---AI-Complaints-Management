import instance from "../utils/instance";

// GET ALL INQUIRY TYPES
export const handleGetInquiryType = async (params) => {
  return await instance.get('/v1/inquiry-types', {
    params
  });
}

// CREATE NEW INQUIRY TYPE
export const createNewInquiryType = async (data) => {
  return await instance.post('/v1/inquiry-types',data);
}

// EDIT EXISTING INQUIRY TYPE
export const editInquiryType = async (id,data) => {
  return await instance.put(`/v1/inquiry-types/${id}`,data);
}

// GET INQUIRY TYPE BY ID
export const getInquiryTypeById = async (id) => {
  return await instance.get(`/v1/inquiry-types/${id}`);
}

// UPDATE INQUIRY TYPE STATUS
export const changeInquiryTypeStatus = async (id,status) => {
  return await instance.patch(`/v1/inquiry-types/${id}/status?status=${status}`);
}

// EXPORT INQUIRY TYPE LIST
export const downloadInquiryTypes = async (params) => {
  return await instance.get('/v1/inquiry-type', { params, responseType: 'arraybuffer' });
}