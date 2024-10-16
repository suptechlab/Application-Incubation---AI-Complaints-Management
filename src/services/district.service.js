import instance from "../utils/instance";

export const handleGetDistricts = async (params) => {
    return await instance.get('/v1/district', {
        params
    });
}

export const handleDeleteDistrict = async (id) => {
    return await instance.delete(`/v1/district/${id}`);
}

export const handleGetDistrictById = async (id) => {
    return await instance.get(`/v1/district/${id}`);
}

export const handleAddDistrict = async (data) => {
    return await instance.post('/v1/district', data);
}

export const handleEditDistrict = async (id, data) => {
    return await instance.put(`/v1/district`, data);
}

export const handleEditDistricts = async (id, data) => {
    data.id = id;
    let status = data.status 
    return await instance.put(`/v1/district/${id}/status?active=${status}`, data);
}

export const handleGetDistrictByStateId = async(stateId)=>{
    return await instance.get(`/v1/districts/state/${stateId}`);
}
export const handleGetNonConsumerDistrictList = async (id) => {
    return await instance.get(`/v1/consumer/${id}/districts`);
}

