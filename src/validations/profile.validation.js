import * as Yup from "yup"

const validationSchema = Yup.object({
    nationalID: Yup.string()
        .max(250, "National ID cannot exceed 250 characters.")
        .required("National ID is required."),
    email: Yup.string()
        .max(250, "Email cannot exceed 250 characters.")
        .required("Email is required."),
    firstName: Yup.string()
        .max(250, "First name cannot exceed 250 characters.")
        .required("First name is required."),
    lastName: Yup.string()
        .max(250, "Last name cannot exceed 250 characters.")
        .required("Last name is required."),
});



export { validationSchema };