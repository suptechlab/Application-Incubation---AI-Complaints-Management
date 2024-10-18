import * as Yup from "yup";

const validationSchema = Yup.object({
    claimTypeName: Yup.string().required("Name of claim type is required."),
    description: Yup.string().required("Description is required.")
});

export { validationSchema };
