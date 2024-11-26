import { ticketApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

// GET TICKET LISTING
export const handleGetTicketList = async (params) => {
  return await ticketApi.get(`/${API_VERSION}/seps-fi/claim-tickets`, {
    params
  });
}