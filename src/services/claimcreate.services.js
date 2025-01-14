import {adminApi, ticketApi,userApi}  from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION


// VALIDATE IDENTIFICATION
export const validateIdentificationApi = async (identification) => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets/validate-identificacion?identificacion=${identification}`);
}
// VALIDATE EMAIL
export const validateEmailApi = async (data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/validate-user-email`,data);
}
// REQUEST OTP
export const requestOTPApi = async (data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/request-otp`,data);
}
// VERIFY OTP
export const verifyOTPApi = async (data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/verify-otp`,data);
}
// CREATE NEW CLAIM API
export const createNewClaimApi = async (data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets`,data);
}
// GET ORGANIZATION LIST DATA
export const organizationListData = async (data) => {
  return await userApi.get(`/${API_VERSION}/masters/organization-list`,data);
}
// GET CITY LIST DATA
export const getCitiesDropdownData = async (provinceId) => {
  return await adminApi.get(`/${API_VERSION}/cities/dropdown-list/${provinceId}`);
}