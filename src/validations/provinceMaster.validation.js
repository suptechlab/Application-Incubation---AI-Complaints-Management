import * as Yup from "yup"

const validationSchema = Yup.object({
  name: Yup.string()
      .max(250, "Province name cannot exceed 250 characters.")
      .required("Province name is required."),
});


export { validationSchema };