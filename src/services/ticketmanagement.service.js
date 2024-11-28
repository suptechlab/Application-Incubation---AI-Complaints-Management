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

// AGENT LISTING
export const agentListingApi = async()=>{
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets/agents-list`);
}
//ASSIGN / REASSIGN TICKET TO SEPS AGENT
export const agentTicketToSEPSagent= async(agentId,tickets)=>{
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${agentId}/assign-tickets-seps-agent`,tickets);
}



// FUNCTION TO CONVERT MASTER DATA FOR DROPDOWN
export const convertToLabelValue=(obj)=> {
  return Object.entries(obj).map(([key, value]) => ({
    label: value, // Use the value as the label
    value: key    // Use the key as the value
  }));
}
