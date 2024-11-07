import instance from "../utils/instance";
const API_VERSION = process.env.REACT_APP_API_VERSION


// GET PERSONAL INFO BY IDENTIFICATION
export const getPersonalInfo = async (identification) => {
  return await instance.get(`/${API_VERSION}/fi-users/person-info?identification=${identification}`);
}

// GET ORGANIZATION INFO BY TAX ID
export const getOrganizationInfo = async (identification) => {
  return await instance.get(`/${API_VERSION}/organization/info?ruc=${identification}`);
  // 1790866084001
}