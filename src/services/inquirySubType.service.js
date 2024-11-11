import {adminApi} from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION
// GET ALL INQUIRY TYPES
export const handleGetInquirySubTypes = async (params) => {
  return await adminApi.get(`/${API_VERSION}/inquiry-sub-types`, {
    params
  });
}

// CREATE NEW INQUIRY SUB TYPE
export const createNewInquirySubType = async (data) => {
  return await adminApi.post(`/${API_VERSION}/inquiry-sub-types`,data);
}

// EDIT EXISTING INQUIRY SUB TYPE
export const editInquirySubType = async (id,data) => {
  return await adminApi.put(`/${API_VERSION}/inquiry-sub-types/${id}`,data);
}

// GET INQUIRY SUB TYPE BY ID
export const getInquirySubTypeById = async (id) => {
  return await adminApi.get(`/${API_VERSION}/inquiry-sub-types/${id}`);
}

// UPDATE INQUIRY SUB TYPE STATUS
export const changeInquirySubTypeStatus = async (id,status) => {
  return await adminApi.patch(`/${API_VERSION}/inquiry-sub-types/${id}/status?status=${status}`);
}

// EXPORT INQUIRY SUB TYPE LIST
export const downloadInquirySubTypes = async (params) => {
  return await adminApi.get(`/${API_VERSION}/inquiry-sub-types/download`, { params, responseType: 'arraybuffer' });
}

// CLAIM TYPE DROPDOWN LIST
export const inquiryTypesDropdownList = async () => {
  return await adminApi.get(`/${API_VERSION}/inquiry-types/dropdown-list`);
}