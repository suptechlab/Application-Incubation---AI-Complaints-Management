import * as Yup from "yup"

const validationSchema = Yup.object({
  provinceName: Yup.string()
      .max(250, "Province master name cannot exceed 250 characters.")
      .required("Province master name is required."),
});


export { validationSchema };