import * as yup from "yup";
import { getValidationMessages } from "../../utils/Validation.service";

const msg = getValidationMessages();

export const PrivacyFormSchema = yup.object({
  agreePrivacy: yup.boolean()
    .oneOf([true], msg.agreePrivacy),
});

export const ChatBotFormSchema = yup.object({
  message: yup.string().nullable()
    .max(5000, msg.maxLengthExceeded),
});

export const ChatLoginFormSchema = yup.object({
  name: yup.string()
    .required(msg.nameRequired),
  nationalId: yup.string()
    .required(msg.nationalIdRequired),
  email: yup.string()
    .email(msg.emailMustBeValid)
    .required(msg.emailRequired),
});

// import * as yup from "yup";

// export const PrivacyFormSchema = yup.object({
//   agreePrivacy: yup.boolean()
//     .oneOf([true], 'You must accept the privacy policy'),
// });

// export const ChatBotFormSchema = yup.object({
//   message: yup.string().required().label('Message'),
// });

// export const ChatLoginFormSchema = yup.object({
//   name: yup.string().required().label('Name'),
//   nationalId: yup.string().required().label('National ID'),
//   email: yup.string().email().required().label('Email'),
// });