import * as yup from "yup";
import { getValidationMessages } from "../../utils/Validation.service";

const msg = getValidationMessages();

export const SecondInstanceFormSchema = yup.object({

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

export const RaiseComplaintSchema = yup.object({

    instanceTicket: yup
        .string()
        .required(msg.secondInstanceTicketRequired),

    precedents: yup
        .string()
        .required(msg.precedentsRequired)
        .max(5000, msg.precedentsMaxLength),

    specificPetition: yup
        .string()
        .required(msg.specificPetitionRequired)
        .max(5000, msg.specificPetitionMaxLength),

    agreeDeclarations: yup
        .boolean()
        .oneOf([true], msg.agreeDeclarationsRequired)

});
