import * as Yup from "yup";

const validationSchema = Yup.object({
    districtCode: Yup.string()
        .matches(/^[a-zA-Z0-9]+$/, "It must contain only letters and numbers.")
        .max(100, 'Maximum limit is 100')
        .required("District code is required."),
    districtName: Yup.string().max(50, 'Maximum limit is 50')
        .required("District name is required."),
    stateId: Yup.string()
        .required("State is required."),
    status: Yup.boolean()
        .required("Status is required.")
});

export { validationSchema };
