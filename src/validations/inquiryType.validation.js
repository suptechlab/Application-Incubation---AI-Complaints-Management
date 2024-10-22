import * as Yup from "yup";
const validationSchema = Yup.object({
  inquiryName: Yup.string()
      .max(250, "Inquiry name cannot exceed 250 characters.")
      .required("Inquiry name is required."),
  description: Yup.string()
      .max(512, "Description cannot exceed 512 characters.")
      .required("Description is required.")
});

export { validationSchema };