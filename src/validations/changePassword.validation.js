import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";
const msg = getValidationMessages();

const validationSchema = Yup.object({
    oldPassword: Yup.string()
        .required(msg.oldPasswordRequired) // Dynamic message for old password required
        .max(16, msg.passwordMax16) // Dynamic message for max length
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            msg.passwordComplexity // Dynamic message for password complexity
        ),
    newPassword: Yup.string()
        .required(msg.newPasswordRequired) // Dynamic message for new password required
        .max(16, msg.passwordMax16) // Dynamic message for max length
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            msg.passwordComplexity // Dynamic message for password complexity
        ),
    confirmPassword: Yup.string()
        .required(msg.confirmPasswordRequired) // Dynamic message for confirm password required
        .oneOf([Yup.ref('newPassword'), null], msg.passwordsMustMatch) // Dynamic message for password match
});

export { validationSchema };
