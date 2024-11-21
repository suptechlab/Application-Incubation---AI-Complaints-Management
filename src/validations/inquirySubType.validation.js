import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

// Get the localized validation messages
const msg = getValidationMessages();

// Define the regex pattern for Spanish characters
const SPANISH_CHARACTERS_REGEX =  /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s,]*$/;

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()  // Ensure spaces at the beginning and end are removed
    .matches(SPANISH_CHARACTERS_REGEX, msg.nameInvalid)  // Use localized invalid name message
    .max(250, msg.nameMax)  // Use localized max length message for name
    .required(msg.nameRequired),  // Use localized required message for name

  inquiryTypeId: Yup.string()
    .required(msg.inquiryTypeRequired),  // Use localized required message for inquiryTypeId

  description: Yup.string()
    .nullable()  // Allow description to be null
    .max(512, msg.descriptionMax),  // Use localized max length message for description
});

export { validationSchema };