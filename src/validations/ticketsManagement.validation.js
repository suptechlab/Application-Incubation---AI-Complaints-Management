import * as Yup from "yup"
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();


const validationSchema = Yup.object({
  message: Yup.string().required(msg.messageRequired)
    .max(500, msg.messageMax500),
});

// SLA DATE EXTENSION
export const slaDateValidation = Yup.object({
  date: Yup.string()
    .required(msg.dateRequired),
});

// TICKET CLOSE STATUS
export const ticketCloseValidation = Yup.object({
  closeSubStatus: Yup.string()
    .required(msg.closeSubStatusRequired),
  reason: Yup.string()
  .required(msg.reasonRequired),
});

// TICKET REJECT STATUS
export const ticketRejectValidation = Yup.object({
  rejectedStatus: Yup.string()
    .required(msg.rejectSubStatusRequired),
  reason: Yup.string()
  .required(msg.reasonRequired),
});


export { validationSchema };