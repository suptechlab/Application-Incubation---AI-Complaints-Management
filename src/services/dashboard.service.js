import {ticketApi} from "../utils/instance";

const API_VERSION = process.env.REACT_APP_API_VERSION

// GET DASHBOARD GRAPHS AND TILES
export const getDashboardGraphAndTiles = async (params) => {
    return await ticketApi.get(`/${API_VERSION}/dashboard/graph-and-tiles`,{params});
}


// GET DASHBOARD GRAPHS AND TILES
export const getClaimsandComplaints = async (params) => {
    return await ticketApi.get(`/${API_VERSION}/dashboard/claim-and-complaints`,{params});
}
