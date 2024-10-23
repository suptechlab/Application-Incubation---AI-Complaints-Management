import instance from "../utils/instance";

// GET ALL INQUIRY TYPES
export const handleGetInquirySubType = async (params) => {
  return await instance.get('/v1/inquiry-sub-type', {
    params
  });
}

// CREATE NEW INQUIRY SUB TYPE
export const createNewInquirySubType = async (data) => {
  return await instance.post('/v1/inquiry-sub-type',data);
}

// EDIT EXISTING INQUIRY SUB TYPE
export const editInquirySubType = async (id,data) => {
  return await instance.put(`/v1/inquiry-sub-type/${id}`,data);
}

// GET INQUIRY SUB TYPE BY ID
export const getInquirySubTypeById = async (id) => {
  return await instance.get(`/v1/inquiry-sub-type/${id}`);
}

// UPDATE INQUIRY SUB TYPE STATUS
export const changeInquirySubTypeStatus = async (id,status) => {
  return await instance.put(`/v1/inquiry-sub-type/${id}?status=${status}`);
}

// EXPORT INQUIRY SUB TYPE LIST
export const exportInquirySubTypes = async () => {
  return await instance.get('/v1/inquiry-sub-type', { params, responseType: 'arraybuffer' });
}