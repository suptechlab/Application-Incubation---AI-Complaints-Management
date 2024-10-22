import * as Yup from "yup";
const validationSchema = Yup.object({
  inquirySubCategory: Yup.string()
      .max(250, "Inquiry subcategory name cannot exceed 250 characters.")
      .required("Inquiry subcategory name is required."),
  inquiryType: Yup.string().required("Inquiry type is required."),
  description: Yup.string()
      .max(512, "Description cannot exceed 512 characters.")
      .required("Description is required.")
});


export { validationSchema };