import instance from "../utils/instance";

export const handleGetStates = async (params) => {
    return await instance.get('/v1/state/list', {
        params
    });
}

export const handleGetStatePagination = async (params) => {
    return await instance.get('/v1/state', {
        params
    });
}

export const handleDeleteState = async (id) => {
    return await instance.delete(`/v1/state/${id}`);
}

export const handleGetStateById = async (id) => {
    return await instance.get(`/v1/state/${id}`);
}

export const handleAddState = async (data) => {
    return await instance.post('/v1/state', data);
}

export const handleUpdateState = async (id, data) => {
    data.id=id
    return await instance.put('/v1/state', data);
}

export const handleEditState = async (id, data) => {
    data.id = id;
    let status = data.status 
    return await instance.put(`/v1/state/${id}/status?active=${status}`, data);
}

export const handleStatusChangeState = async (id, status) => {
    return await instance.put(`/v1/state/${id}/status?active=${status}`, {});
}