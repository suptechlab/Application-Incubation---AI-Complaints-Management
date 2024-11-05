import instance from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

// GET AUDIT LOGS LIST
export const handleGetAuditLogs = async (params) => {
  return await instance.get(`/${API_VERSION}/audit-logs`, {
    params
  });
}

// GET AUDIT LOG BY ID
export const getAuditLogsById = async (id) => {
  return await instance.get(`/${API_VERSION}/audit-logs/${id}`);
}