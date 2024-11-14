import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";
const msg = getValidationMessages();

const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const validationSchema = Yup.object({
    email: Yup.string()
        .matches(emailRegExp, msg.emailMustValid)
        .required(msg.emailRequired).max(100, msg.maximumLimit100),

});

export { validationSchema };
