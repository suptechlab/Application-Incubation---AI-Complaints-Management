import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

// Get the localized validation messages
const msg = getValidationMessages();

// Define the regex pattern for Spanish characters
const SPANISH_CHARACTERS_REGEX =  /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s,]*$/;

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()  // Ensure spaces at the beginning and end are removed
    .matches(SPANISH_CHARACTERS_REGEX, msg.nameInvalid)  // Ensure only valid Spanish characters
    .max(250, msg.nameMax)  // Ensure the name doesn't exceed 250 characters
    .required(msg.nameRequired),  // Name is required

  provinceId: Yup.string()
    .required(msg.provinceRequired),  // Province is required
});

export { validationSchema };
