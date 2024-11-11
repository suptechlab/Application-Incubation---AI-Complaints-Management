import * as yup from "yup";

export const LoginFormSchema = yup.object({
  email: yup
    .string()
    .email()
    .required()
    .label("Email address"),
});

export const OtpFormSchema = yup.object({
  otpCode: yup
    .string()
    .required()
    .label("OTP")
    .matches(/^\d{4}$/, "OTP max 4 digits and only numbers"),
});
