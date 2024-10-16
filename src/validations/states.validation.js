import * as Yup from "yup";

const validationSchema = Yup.object({
    stateName: Yup.string().max(50, 'Maximum limit is 50')
        .required("State name is required."),
    stateCode: Yup.string().max(10, 'Maximum limit is 10')
    .matches(/^[a-zA-Z0-9]+$/, "It must contain only letters and numbers.")
        .required("State code is required."),
    status: Yup.boolean()
        .required("Status is required.")
});

export { validationSchema };
