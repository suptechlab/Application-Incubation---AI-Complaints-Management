import * as Yup from "yup"

const validationSchema = Yup.object({
  templateName: Yup.string()
    .max(250, "Template master name cannot exceed 250 characters.")
    .required("Template master name is required."),
});



export { validationSchema };