import * as Yup from "yup"

const validationSchema = Yup.object({
  description: Yup.string()
    .max(1500, "Description cannot exceed 1500 characters."),
});


export const slaDateValidation =  Yup.object({
  date: Yup.string()
    .required("Date is required!"),
});



export { validationSchema };