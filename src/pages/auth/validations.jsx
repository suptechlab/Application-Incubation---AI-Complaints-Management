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
  countryCode: yup
    .string()
    .required()
    .label("Country Code"),
  phoneNumber: yup
    .string()
    .matches(/^[1-9][\s-]?\d{9,14}$/, 'Phone number must be valid')
    .required()
    .label("Phone number"),
  email: yup
    .string()
    .email()
    .required()
    .label("Email address"),
});

export const BasicInfoFormSchema = yup.object({
  identificacion: yup
    .string()
    .required()
    .label("National ID number"),
  email: yup
    .string()
    .email()
    .required()
    .label("Email address"),
  name: yup
    .string()
    .required()
    .label("Name"),
  gender: yup
    .string()
    .required()
    .label("Gender"),
  countryCode: yup.string()
    // .required("Country code is required")
    .matches(/^\+\d{1,4}$/, "Country code must be a valid international dialing code (e.g., +1, +91)")
    .max(5, "Country code must not exceed 5 characters"),
  phoneNumber: yup.string()
    // .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only digits")
    .max(15, "Phone number must not exceed 15 characters"),
  provinceId: yup
    .string()
    .required()
    .label("Province of residence"),
  cityId: yup
    .string()
    .required()
    .label("canton of residence"),
});

export const OtherInfoFormSchema = yup.object({
  priorityCareGroup: yup
    .string()
    .required()
    .label("Priority care group"),
  customerType: yup
    .string()
    .required()
    .label("Customer type"),
  organizationId: yup
    .string()
    .required()
    .label("Entity name"),
  // entitysTaxID: yup
  //   .string()
  //   .required()
  //   .label("Entity's tax ID (RUC)"),
});

export const ClaimDetailsFormSchema = yup.object({
  claimTypeId: yup
    .string()
    .required()
    .label("Claim type"),
  claimSubTypeId: yup
    .string()
    .required()
    .label("Claim subtype"),
  precedents: yup
    .string()
    .required()
    .max(1024, "Precedents must not exceed 1024 characters.")
    .label("Precedents"),
  specificPetition: yup
    .string()
    .required()
    .max(1024, "Precedents must not exceed 1024 characters.")
    .label("Specific Petition"),
  attachments: yup
    .string()
    .label("Attachments"),
  agreeDeclarations: yup
    .boolean()
    .oneOf([true], 'Please agree to all declarations and conditions to proceed.'),
});