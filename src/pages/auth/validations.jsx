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
  nationalID: yup
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
  cellphone: yup
    .string()
    .required()
    .label("Cellphone"),
  provinceOfResidence: yup
    .string()
    .required()
    .label("Province of residence"),
  cantonOfResidence: yup
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
  entityName: yup
    .string()
    .required()
    .label("Entity name"),
  entitysTaxID: yup
    .string()
    .required()
    .label("Entity's tax ID (RUC)"),
});

export const ClaimDetailsFormSchema = yup.object({
  claimType: yup
    .string()
    .required()
    .label("Claim type"),
  claimSubtype: yup
    .string()
    .required()
    .label("Claim subtype"),
  precedents: yup
    .string()
    .required()
    .label("Precedents"),
  specificPetition: yup
    .string()
    .required()
    .label("Specific Petition"),
  attachments: yup
    .string()
    .label("Attachments"),
  agreeDeclarations: yup
    .boolean()
    .oneOf([true], 'Please agree to all declarations and conditions to proceed.'),
});