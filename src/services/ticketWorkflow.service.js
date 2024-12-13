import { ticketApi } from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

//Get Events API
export const handleGetEventList = async (params) => {
    return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets`, {
        params
    });
}