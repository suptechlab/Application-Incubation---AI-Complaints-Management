import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";


const msg = getValidationMessages();

// Define the regex pattern for Spanish characters
const SPANISH_CHARACTERS_REGEX = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$/;

const validationSchema = Yup.object({
  name: Yup.string()
  .trim() // Remove leading and trailing spaces
    .matches(
      SPANISH_CHARACTERS_REGEX,
     msg.nameInvalid
    )
    .max(250, msg.nameMax)
    .required(msg.nameRequired),
  description: Yup.string()
    .nullable()
    .max(512, msg.descriptionMax),
});

export { validationSchema };
