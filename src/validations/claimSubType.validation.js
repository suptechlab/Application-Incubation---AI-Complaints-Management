import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

// Define the regex pattern for Spanish characters
const SPANISH_CHARACTERS_REGEX =  /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s,]*$/;;

const validationSchema = Yup.object({
  name: Yup.string().trim()
    .matches(SPANISH_CHARACTERS_REGEX, msg.nameInvalid)  // Apply regex for valid Spanish characters
    .max(250, msg.nameMax)  // Max length validation
    .required(msg.nameRequired),  // Required field validation

  claimTypeId: Yup.string().required(msg.claimTypeIdRequired),

  slaBreachDays: Yup.number()
    .typeError(msg.slaBreachDaysInvalid)
    .required(msg.slaBreachDaysRequired)
    .min(0, msg.slaBreachDaysNegative),

  description: Yup.string()
    .nullable()
    .max(512, msg.descriptionMax),  // Max length validation for description
});

export { validationSchema };