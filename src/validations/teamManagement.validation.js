import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();
const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validationSchema = Yup.object({
      entityName: Yup.string()
        .required(msg.nameRequired) // Dynamic message for name required
        .max(100, msg.maximumLimit100), // Dynamic message for max length

      teamName: Yup.string()
        .required(msg.nameRequired) // Dynamic message for email required
        .max(100, msg.maximumLimit100), // Dynamic message for max length

     activated: Yup.boolean(),
});

export { validationSchema };
