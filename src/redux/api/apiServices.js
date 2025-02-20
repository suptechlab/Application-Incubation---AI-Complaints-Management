import { ticketsApi } from "./axios";

const API_VERSION = process.env.REACT_APP_API_VERSION
// SATISFACTION SURVEY FORM API
export const satisfactionSurveyFormApi = async (data) => {
  return await ticketsApi.post(`/${API_VERSION}/survey/submit`,data);
}