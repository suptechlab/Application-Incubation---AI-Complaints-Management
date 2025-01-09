import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";
const msg = getValidationMessages();

const validationSchema = Yup.object({
    // nationalID: Yup.string()
    //     .max(250, msg.nationalIDMax) // Use dynamic message for National ID max length
    //     .required(msg.nationalIDRequired), // Use dynamic message for National ID required
    // email: Yup.string()
    //     .max(250, msg.emailMax) // Use dynamic message for email max length
    //     .required(msg.emailRequired), // Use dynamic message for email required
    // firstName: Yup.string()
    //     .max(250, msg.firstNameMax) // Use dynamic message for first name max length
    //     .required(msg.firstNameRequired), // Use dynamic message for first name required
   profile : Yup.string().required(msg.profileRequired)
});

export { validationSchema };
