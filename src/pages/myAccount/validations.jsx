import * as yup from "yup";
import { getValidationMessages } from "../../utils/Validation.service";

const msg = getValidationMessages();

export const InstanceFormSchema = yup.object({

    instanceTicket: yup
        .string()
        .required(msg.firstInstanceTicketRequired),

    comments: yup
        .string()
        .required(msg.commentsRequired),

    agreeDeclarations: yup
        .boolean()
        .oneOf([true], msg.agreeDeclarationsRequired),

});

export const ChatSchema = yup.object({

    message: yup
        .string()
        .required(msg.messageRequired)

});
