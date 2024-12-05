import * as Yup from "yup"

const validationSchema = Yup.object({
  description: Yup.string()
    .max(1500, "Description cannot exceed 1500 characters."),
});

// SLA DATE EXTENSION
export const slaDateValidation = Yup.object({
  date: Yup.string()
    .required("Date is required!"),
});

// TICKET CLOSE STATUS
export const ticketCloseValidation = Yup.object({
  closeSubStatus: Yup.string()
    .required("Close sub status is required!"),
  reason: Yup.string()
  .required("Reason is required!"),
});



export { validationSchema };