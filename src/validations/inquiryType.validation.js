import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

// Define the regex pattern for Spanish characters
const SPANISH_CHARACTERS_REGEX = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$/;

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()  // Ensure spaces at the beginning and end are removed
    .matches(SPANISH_CHARACTERS_REGEX, msg.nameInvalid)  // Ensure only valid Spanish characters
    .max(250, msg.nameMax)  // Ensure the name doesn't exceed 250 characters
    .required(msg.nameRequired),  // Name is required

  description: Yup.string()
    .nullable()  // Allow null values for description
    .max(512, msg.descriptionMax),  // Description cannot exceed 512 characters
});

export { validationSchema };