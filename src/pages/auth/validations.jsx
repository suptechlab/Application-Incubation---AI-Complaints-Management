import * as yup from "yup";
import { getValidationMessages } from "../../utils/Validation.service";

const msg = getValidationMessages();

export const LoginFormSchema = yup.object({
  email: yup
    .string()
    .email(msg.emailMustBeValid)
    .required(msg.emailRequired),
});

export const OtpFormSchema = yup.object({
  otpCode: yup
    .string()
    .required(msg.otpRequired)
    .matches(/^\d{6}$/, msg.otpMax6Digits),
});

export const IdVerificationFormSchema = yup.object({
  nationalID: yup
    .string()
    .required(msg.nationalIdRequired),
  fingerprintCode: yup
    .string()
    .required(msg.fingerprintCodeRequired),
});

export const PersonalInfoTabSchema = yup.object({
  countryCode: yup
    .string()
    .required(msg.countryCodeRequired),
  phoneNumber: yup
    .string()
    .matches(/^\d{10}$/, msg?.phoneNumberMustBeDigits)
    // .matches(/^[1-9][\s-]?\d{9,14}$/, msg.phoneNumberMustBeValid)
    .required(msg.phoneNumberRequired),
  email: yup
    .string()
    .email(msg.emailMustBeValid)
    .required(msg.emailRequired),
});

export const BasicInfoFormSchema = yup.object({
  identificacion: yup
    .string()
    .required(msg.nationalIdRequired),
  email: yup
    .string()
    .email(msg.emailMustBeValid)
    .required(msg.emailRequired),
  name: yup
    .string()
    .required(msg.nameRequired),
  gender: yup
    .string()
    .required(msg.genderRequired),
  countryCode: yup.string()
    .matches(/^\+\d{1,4}$/, msg.countryCodeMustBeValid)
    .max(5, msg.countryCodeMaxLength),
  phoneNumber: yup.string()
    .matches(/^\d+$/, msg.phoneNumberMustBeDigits)
    .max(15, msg.phoneNumberMaxLength),
  provinceId: yup
    .string()
    .required(msg.provinceRequired),
  cityId: yup
    .string()
    .required(msg.cityRequired),
});

export const OtherInfoFormSchema = yup.object({
  priorityCareGroup: yup
    .string().nullable(),
    // .required(msg.priorityCareGroupRequired),
  customerType: yup
    .string()
    .required(msg.customerTypeRequired),
  organizationId: yup
    .string()
    .required(msg.organizationRequired),
});

export const ClaimDetailsFormSchema = yup.object({
  claimTypeId: yup
    .string()
    .required(msg.claimTypeRequired),
  claimSubTypeId: yup
    .string()
    .required(msg.claimSubTypeRequired),
  precedents: yup
    .string()
    .required(msg.precedentsRequired)
    .max(1024, msg.precedentsMaxLength),
  specificPetition: yup
    .string()
    .required(msg.specificPetitionRequired)
    .max(1024, msg.specificPetitionMaxLength),
  attachments: yup
    .string()
    .label(msg.attachments),
  agreeDeclarations: yup
    .boolean()
    .oneOf([true], msg.agreeDeclarationsRequired),
});
