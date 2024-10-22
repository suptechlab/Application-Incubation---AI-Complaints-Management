import * as Yup from "yup";

const validationSchema = Yup.object({
    claimSubTypeName: Yup.string()
        .max(250, "Claim subtype name cannot exceed 250 characters.")
        .required("Claim subtype name is required."),
    claimType: Yup.string().required("Claim type is required."),
    SLABreachDay: Yup.number()
        .typeError("SLA Breach Day must be a number.")
        .required("SLA Breach Day is required.")
        .min(0, "SLA Breach Day cannot be a negative number."),
    description: Yup.string()
        .max(512, "Description cannot exceed 512 characters.")
        .required("Description is required.")
});



export { validationSchema };
