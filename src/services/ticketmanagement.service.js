import { ticketApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

// GET TICKET LISTING
export const handleGetTicketList = async (params) => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets`, {
    params
  });
}


// GET TICKET DETAILS
export const ticketDetailsApi = async (id) => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets/${id}`);
}

// CALL MASTERS API
export const ticketMastersData = async()=>{
  return await ticketApi.get(`/${API_VERSION}/masters`);
}

// FUNCTION TO CONVERT MASTER DATA FOR DROPDOWN
export const convertToLabelValue=(obj)=> {
  return Object.entries(obj).map(([key, value]) => ({
    label: value, // Use the value as the label
    value: key    // Use the key as the value
  }));
}