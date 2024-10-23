import * as Yup from "yup";

const validationSchema = Yup.object({
    claimTypeName: Yup.string().max(250, "Claim type name cannot exceed 250 characters").required("Name of claim type is required."),
    description: Yup.string().max(512, "Description cannot exceed 512 characters").required("Description is required.")
});


export { validationSchema };
