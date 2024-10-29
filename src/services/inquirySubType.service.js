import instance from "../utils/instance";

// GET ALL INQUIRY TYPES
export const handleGetInquirySubTypes = async (params) => {
  return await instance.get('/v1/inquiry-sub-types', {
    params
  });
}

// CREATE NEW INQUIRY SUB TYPE
export const createNewInquirySubType = async (data) => {
  return await instance.post('/v1/inquiry-sub-types',data);
}

// EDIT EXISTING INQUIRY SUB TYPE
export const editInquirySubType = async (id,data) => {
  return await instance.put(`/v1/inquiry-sub-types/${id}`,data);
}

// GET INQUIRY SUB TYPE BY ID
export const getInquirySubTypeById = async (id) => {
  return await instance.get(`/v1/inquiry-sub-types/${id}`);
}

// UPDATE INQUIRY SUB TYPE STATUS
export const changeInquirySubTypeStatus = async (id,status) => {
  return await instance.patch(`/v1/inquiry-sub-types/${id}/status?status=${status}`);
}

// EXPORT INQUIRY SUB TYPE LIST
export const downloadInquirySubTypes = async (params) => {
  return await instance.get('/v1/inquiry-sub-types/download', { params, responseType: 'arraybuffer' });
}

// CLAIM TYPE DROPDOWN LIST
export const inquiryTypesDropdownList = async () => {
  return await instance.get('/v1/inquiry-types/dropdown-list');
}