import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

const validationSchema = Yup.object({
  templateName: Yup.string()
    .max(250, msg.maximum250Characters) // Dynamic message for max 250 characters
    .required(msg.templateNameRequired), // Dynamic message for required field

  templateType: Yup.string()
    .max(250, msg.maximum250Characters) // Dynamic message for max 250 characters
    .required(msg.templateTypeRequired), // Dynamic message for required field
  userType: Yup.string()
    .required(msg.userTypeRequired), // Dynamic message for required field
  subject: Yup.string()
    .max(250, msg.maximum250Characters) // Dynamic message for max 250 characters
    .required(msg.subjectRequired), // Dynamic message for required field

  content: Yup.string()
    .max(8500, msg.templateContentMax1500) // Dynamic message for max 1500 characters
    .required(msg.templateContentRequired), // Dynamic message for required field
});

export { validationSchema };
