import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

const validationSchema = Yup.object({
      teamName: Yup.string()
        .required(msg.nameRequired) // Dynamic message for name required
        .max(100, msg.maximumLimit100), // Dynamic message for max length

      description: Yup.string()
        .required(msg.nameRequired) // Dynamic message for email required
        .max(100, msg.maximumLimit100), // Dynamic message for max length
});

export { validationSchema };
