import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

const validationSchema = Yup.object({
    password: Yup.string()
        .required(msg.passwordRequired)
        .max(16, msg.passwordMax16)
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            msg.passwordComplexity
        ),
    confirmPassword: Yup.string()
        .required(msg.confirmPasswordRequired)
        .oneOf([Yup.ref('password'), null], msg.passwordsMustMatch),
});

export { validationSchema };
