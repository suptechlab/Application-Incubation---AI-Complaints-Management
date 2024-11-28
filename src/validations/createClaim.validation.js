import * as yup from "yup";


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