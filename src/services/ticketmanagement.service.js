import { ticketApi } from "../utils/instance";

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
export const ticketMastersData = async () => {
  return await ticketApi.get(`/${API_VERSION}/masters`);
}

// AGENT LISTING
export const agentListingApi = async () => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets/agents-list`);
}
//ASSIGN / REASSIGN TICKET TO SEPS AGENT
export const agentTicketToSEPSagent = async (agentId, tickets) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${agentId}/assign-tickets-seps-agent`, tickets);
}
//ASSIGN / REASSIGN TICKET TO FI AGENT
export const agentTicketToFIagent = async (agentId, tickets) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${agentId}/assign-tickets-fi-agent`, tickets);
}
//CHANGE TICKET PRIORITY
export const changeTicketPriority = async (ticketId, priority) => {
  return await ticketApi.patch(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/priority?priority=${priority}`);
}

//CHANGE TICKET PRIORITY
export const ticketActivityLogs = async (ticketId, params) => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/activity-logs`, { params });
}
//CHANGE TICKET PRIORITY
export const ticketOverviewAPI = async () => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets/count-by-status`);
}
//SLA DATE EXTENSION API
export const slaDateExtensionApi = async (ticketId, slaDate) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/extend-sla?slaDate=${slaDate}`);
}
//TICKET CLOSE API
export const ticketCloseStatus = async (ticketId, data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/closed`,data);
}
//TICKET REJECT API
export const ticketRejectStatus = async (ticketId, data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/reject`,data);
}
//TICKET REPLY TO CUSTOMER API
export const ticketReplyToCustomer = async (ticketId, data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/reply-to-customer`,data);
}
//TICKET REPLY INTERNAL API
export const ticketReplyInternal = async (ticketId, data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/reply-to-internal`,data);
}

//TICKET INTERNAL NOTE API
export const internalNoteApi = async (ticketId, data) => {
  return await ticketApi.post(`/${API_VERSION}/seps-fi/claim-tickets/${ticketId}/add-internal-note`,data);
}
//TICKET ATTACHMENT DOWNLOAD API
export const downloadTicketsAttachment = async (attachmentId) => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets/download/${attachmentId}`,{ responseType: 'arraybuffer' });
}


// FUNCTION TO CONVERT MASTER DATA FOR DROPDOWN
export const convertToLabelValue = (obj) => {
  return Object.entries(obj).map(([key, value]) => ({
    label: value, // Use the value as the label
    value: key    // Use the key as the value
  }));
}
