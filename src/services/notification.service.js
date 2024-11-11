import {adminApi} from "../utils/instance";


export const handleGetNotifications = async (params) => {
    return await adminApi.get('/v1/notifications', {
        params
    });
}

export const handleMarkNotificationById = async (id) => {
    return await adminApi.get(`/v1/notifications/${id}`);
}

export const handleMarkAllNotifications = async (params) => {
    return await adminApi.post('/v1/notifications/mark-all-read', {
        params
    });
}

export const handleDeleteNotification = async (id) => {
    return await adminApi.delete(`/v1/notifications/${id}`);
}

export const handleDeleteAllNotification = async (params) => {
    return await adminApi.delete(`/v1/notifications`);
}

export const handleCountNotifications = async () => {
    return await adminApi.get(`/v1/notifications/count`);
}

