import * as yup from "yup";

export const PrivacyFormSchema = yup.object({
  agreePrivacy: yup.boolean()
    .oneOf([true], 'You must accept the privacy policy'),
});

export const ChatBotFormSchema = yup.object({
  message: yup.string().required().label('Message'),
});
