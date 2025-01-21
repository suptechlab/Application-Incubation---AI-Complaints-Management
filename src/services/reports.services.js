import {adminApi, ticketApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

// GET AUDIT LOGS LIST
export const handleGetAuditLogs = async (params) => {
  return await adminApi.get(`/${API_VERSION}/audit-logs`, {
    params
  });
}

// GET AUDIT LOG BY ID
export const getAuditLogsById = async (id) => {
  return await adminApi.get(`/${API_VERSION}/audit-logs/${id}`);
}

// CLAIM OVERVIEW REPORT API 
export const claimOverviewReportApi = async(params)=>{
  return await ticketApi.get(`/${API_VERSION}/report/claim-overview`,{params});
}

// DOWNLOAD OVERVIEW REPORT API 
export const downloadClaimOverviewReportApi = async(params)=>{
  return await ticketApi.get(`/${API_VERSION}/report/claim-overview/download`,{params , responseType:'arraybuffer'});
}