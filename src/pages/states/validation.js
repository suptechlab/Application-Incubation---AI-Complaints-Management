import * as Yup from "yup";

export const StateSchema = Yup.object({
    first_name: Yup.string().required("FIRST_NAME_REQUIRED").transform((value) => value.trim()).min(2, "FIRST_NAME_MIN_MSG").max(20, "FIRST_NAME_MAX_MSG"),
    last_name: Yup.string().required("LAST_NAME_REQUIRED").transform((value) => value.trim()).min(2, "LAST_NAME_MIN_MSG").max(20, "LAST_NAME_MAX_MSG"),
    email: Yup.string().required("EMail Required"),
    countryCode: Yup.string(),
    phone: Yup.string().min(10, "INVALID_PHONE"),
    role_id: Yup.string().required("ROLE_IS_REQUIRED"),
    company_id: Yup.string().required("Company_IS_REQUIRED"),
    status: Yup.boolean(),
});