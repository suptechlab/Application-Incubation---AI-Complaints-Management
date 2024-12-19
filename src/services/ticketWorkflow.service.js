import { adminApi, ticketApi } from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

//Add Workflow
export const addTicketWorkflow = async (payload) => {
    return await ticketApi.post(`/${API_VERSION}/claim-ticket-work-flow`, payload);
}

//Get Workflow Listing
export const handleGetWorkflowTableData = async (params) => {
    return await ticketApi.get(`/${API_VERSION}/claim-ticket-work-flow`, {
        params
    });
}

//Edit Workflow
export const editTicketWorkflow = async (params) => {
    return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets`, {
        params
    });
}

//Status Change
export const ticketWorkflowStatusChange = async (params) => {
    return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets`, {
        params
    });
}

//Get Workflow by Id
export const handleGetWorkflowById = async (id) => {
    return await ticketApi.get(`/${API_VERSION}/claim-ticket-work-flow/${id}`);
}

//Get Team list by Org id
export const getTeamList = async (orgId) => {
    let url = `/${API_VERSION}/teams/dropdown-list-for-workflow`;
    if (orgId.length !== 0) {
        url += `?organizationId=${orgId}`;
    }
    return await adminApi.get(url);
}

//Get Team Members List
export const getTeamMemberList = async (teamId) => {
    return await adminApi.get(`/${API_VERSION}/teams/${teamId}/member/dropdown-list-for-workflow`);
}

//Get Team Members List
export const getTemplateList = async () => {
    return await adminApi.get(`/${API_VERSION}/templates/dropdown-list-for-workflow`);
}

//Get Team Members List
export const getAgentList = async (orgId) => {
    let url = `/${API_VERSION}/agent/dropdown-list-for-workflow`;
    if (orgId.length !== 0) {
        url += `?organizationId=${orgId}`;
    }
    return await adminApi.get(url);
}