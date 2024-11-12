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
    .matches(/^\d{6}$/, "OTP max 6 digits and only numbers"),
});

export const IdVerificationFormSchema = yup.object({
  nationalID: yup
    .string()
    .required()
    .label("National ID number"),
  fingerprintCode: yup
    .string()
    .required()
    .label("Fingerprint code"),
});

export const PersonalInfoTabSchema = yup.object({
  phoneNumber: yup
    .string()
    .required()
    .label("Phone number"),
  email: yup
    .string()
    .email()
    .required()
    .label("Email address"),
});