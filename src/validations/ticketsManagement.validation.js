import * as Yup from "yup"

const validationSchema = Yup.object({
  message: Yup.string().required("Message is required!")
    .max(500, "Message cannot exceed 500 characters."),
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

// TICKET REJECT STATUS
export const ticketRejectValidation = Yup.object({
  rejectedStatus: Yup.string()
    .required("Reject sub status is required!"),
  reason: Yup.string()
  .required("Reason is required!"),
});


export { validationSchema };