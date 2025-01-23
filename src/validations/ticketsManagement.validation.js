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
  // claimAmount: Yup.number()
  //   .required(msg.reasonRequired),

  claimAmount: Yup.number()
    .when('closeSubStatus', {
      is: (value) => value === 'CLOSED_IN_FAVOR_OF_CONSUMER' || value === 'CLOSED_IN_PARTIAL_FAVOR_OF_CONSUMER',  // Check if 'CLOSED' is part of the string
      then:(schema) => schema.required(msg.amountRequired),
      otherwise:(schema)=> schema.notRequired(),
    }),
});

// TICKET REJECT STATUS
export const ticketRejectValidation = Yup.object({
  rejectedStatus: Yup.string()
    .required(msg.rejectSubStatusRequired),
  reason: Yup.string()
    .required(msg.reasonRequired),
});


// TICKET REMINDER FORM VALIDATION
export const reminderFormValidation = Yup.object({
  comment: Yup.string()
    .required(msg.commentRequired),
});

export const ticketEditValidation = Yup.object({

})

export { validationSchema };