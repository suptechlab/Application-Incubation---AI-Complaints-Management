import instance from "../utils/instance";

export const getListingData = async (params) => {
    return await instance.get('/v1/dashboard/gas-subsidy-values', {
        params
    });
}

export const getDashbaordData = async (params) => {
    return await instance.get('/v1/dashboard/graphs', {
        params
    });
}

export const handleGetCompany = async (id) => {
    return await instance.get(`/v1/companies`);
}

export const handleGetStates = async (params) => {
    return await instance.get('/v1/state/list', {
        params
    });
}

export const handleGetFinancialYear = async () => {
    return await instance.get(`/v1/financial-years/list`);
}

export const handleGetMinistryDashboardCompanies = async () => {
    return await instance.get(`/v1/ministry-dashboard-companies`);
}


