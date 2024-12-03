import * as yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();


export const BasicInfoFormSchema = yup.object({

  identification: yup
    .string()
    .required(msg.nationalIDRequired),

  email: yup
    .string()
    .email()
    .required(msg.emailRequired),

  name: yup
    .string()
    .required(msg.nameRequired),

  gender: yup
    .string()
    .required(msg.genderRequired),

  countryCode: yup.string(),

  phoneNumber: yup.string()
    .max(10, msg.phoneNumberInvalid),

  provinceId: yup
    .string()
    .required(msg.provinceRequired),


  cityId: yup
    .string()
    // .required(msg.cantonRequired)
});

export const OtherInfoFormSchema = yup.object({

  priorityCareGroup: yup
    .string()
    .required(msg.priorityCareRequired),

  customerType: yup
    .string()
    .required(msg.customterTypeRequired),

  organizationId: yup
    .string()
    .required(msg.entityNameRequired),

  entitysTaxID: yup
    .string()
    .required(msg.rucRequired)
});

export const ClaimDetailsFormSchema = yup.object({

  claimTypeId: yup
    .string()
    .required(msg.claimTypeIdRequired),

  claimSubTypeId: yup
    .string()
    .required(msg.claimSubTypeRequired),

  precedents: yup
    .string()
    .required(msg.precedentsRequired)
    .max(1024, msg.invalidPrecedents),

  specificPetition: yup
    .string()
    .required(msg.precedentsRequired)
    .max(1024, msg.invalidPrecedents),

  attachments: yup
    .string()
    .label("Attachments"),

  agreeDeclarations: yup
    .boolean()
    .oneOf([true], msg.agreeDeclarations),
});