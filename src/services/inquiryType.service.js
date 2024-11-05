import instance from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION
// GET ALL INQUIRY TYPES
export const handleGetInquiryType = async (params) => {
  return await instance.get(`/${API_VERSION}/inquiry-types`, {
    params
  });
}

// CREATE NEW INQUIRY TYPE
export const createNewInquiryType = async (data) => {
  return await instance.post(`/${API_VERSION}/inquiry-types`,data);
}

// EDIT EXISTING INQUIRY TYPE
export const editInquiryType = async (id,data) => {
  return await instance.put(`/${API_VERSION}/inquiry-types/${id}`,data);
}

// GET INQUIRY TYPE BY ID
export const getInquiryTypeById = async (id) => {
  return await instance.get(`/${API_VERSION}/inquiry-types/${id}`);
}

// UPDATE INQUIRY TYPE STATUS
export const changeInquiryTypeStatus = async (id,status) => {
  return await instance.patch(`/${API_VERSION}/inquiry-types/${id}/status?status=${status}`);
}

// EXPORT INQUIRY TYPE LIST
export const downloadInquiryTypes = async (params) => {
  return await instance.get(`/${API_VERSION}/inquiry-types/download`, { params, responseType: 'arraybuffer' });
}