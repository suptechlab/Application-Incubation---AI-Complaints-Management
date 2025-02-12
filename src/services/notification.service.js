import { adminApi } from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION

// GET ALL NOTIFICATIONS API
export const handleGetNotifications = async (params) => {
    return await adminApi.get(`/${API_VERSION}/notifications`,{params});
}
// READ NOTIFICATION BY ID
export const handleMarkNotificationById = async (notificationId) => {
    return await adminApi.post(`/${API_VERSION}/notifications/${notificationId}/mark-as-read`);
}
// MARK READ ALL NOTIFICATION
export const handleMarkAllNotifications = async () => {
    return await adminApi.post(`/${API_VERSION}/notifications/mark-as-read-all`);
}
// DELETE NOTIFICATION BY ID
export const handleDeleteNotification = async (notificationId) => {
    return await adminApi.delete(`/${API_VERSION}/notifications/${notificationId}`);
}
// DELETE ALL NOTIFICATIONS API
export const handleDeleteAllNotification = async () => {
    return await adminApi.delete(`/${API_VERSION}/notifications/delete/all`);
}
// API FOR NOTIFICATION COUNT
export const handleCountNotifications = async () => {
    return await adminApi.get(`/${API_VERSION}/notifications/count`);
}

