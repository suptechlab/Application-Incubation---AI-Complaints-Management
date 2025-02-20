import * as yup from "yup";
import { getValidationMessages } from "../../utils/Validation.service";

const msg = getValidationMessages();

export const surveyValidationSchema = yup.object({
  easeOfFindingInfo: yup.string().required(msg.satisfactionRequiredMsg),
  providedFormats: yup.string().required(msg.satisfactionRequiredMsg),
  responseClarity: yup.string().required(msg.satisfactionRequiredMsg),
  attentionTime: yup.string().required(msg.satisfactionRequiredMsg),
  comment: yup.string().nullable().max(5000, msg.maxLengthExceeded),
});