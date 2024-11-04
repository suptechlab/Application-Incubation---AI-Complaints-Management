import instance from "../utils/instance";


export const handleGetNotifications = async (params) => {
    return await instance.get('/v1/notifications', {
        params
    });
}

export const handleMarkNotificationById = async (id) => {
    return await instance.get(`/v1/notifications/${id}`);
}

export const handleMarkAllNotifications = async (params) => {
    return await instance.post('/v1/notifications/mark-all-read', {
        params
    });
}

export const handleDeleteNotification = async (id) => {
    return await instance.delete(`/v1/notifications/${id}`);
}

export const handleDeleteAllNotification = async (params) => {
    return await instance.delete(`/v1/notifications`);
}

export const handleCountNotifications = async () => {
    return await instance.get(`/v1/notifications/count`);
}

