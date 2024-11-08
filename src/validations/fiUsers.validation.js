import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";


const msg = getValidationMessages();
const validationSchema = Yup.object().shape({
  identification: Yup.string().required(msg.identificationRequired),
  name: Yup.string().required(msg.nameRequired),
  email: Yup.string().email(msg.emailInvalid).required(msg.emailRequired),
  phoneNumber: Yup.string()
    .nullable()
    .matches(/^\d{10}$/, msg.phoneNumberInvalid)
    .notRequired(),
  countryCode: Yup.string()
    .nullable()
    .when('phoneNumber', (phoneNumber, schema) => {
      if (phoneNumber) {
        return schema
          .required(msg.countryCodeRequired)
          .matches(/^\+\d+$/, msg.countryCodeInvalid);
      }
      return schema;
    }),
  ruc: Yup.string().required(msg.rucRequired),
  roleId: Yup.string().required(msg.roleIdRequired),
});

export { validationSchema };
