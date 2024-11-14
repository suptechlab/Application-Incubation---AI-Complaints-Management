import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";
const msg = getValidationMessages();

const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;


const validationSchema = Yup.object({
    email: Yup.string()
        .matches(emailRegExp, msg.emailMustValid)
        .required(msg.emailRequired).max(100, msg.maximumLimit100),
        password: Yup.string().required(msg.passwordRequired).max(100, msg.maximumLimit100)

});

// OTP validation
const OtpValidationSchema = Yup.object().shape({
    otpCode: Yup.string()
    .required(msg.otpRequired)
    .matches(/^\d{6}$/, msg.otpMax6Digit)
  });

export { validationSchema, OtpValidationSchema };
