import * as yup from "yup";
import { getValidationMessages } from "../../utils/Validation.service";

const msg = getValidationMessages();

export const profileFormValidationSchema = yup.object({
  phoneNumber: yup
  .string()
  .nullable() // Allow null or undefined values
  .matches(/^\d{9}$/, msg?.phoneNumberMustBeDigits) // Validate format
});
