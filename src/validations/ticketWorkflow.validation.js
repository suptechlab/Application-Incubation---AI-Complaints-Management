import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

const ticketWorkflowSchema = Yup.object({

    entityId: Yup.string()
        .when('userType', {
            is: (userType) => userType === 'SUPER_ADMIN' || userType === 'SEPS_ADMIN',
            then: (schema) => schema.required(msg.entityRequired),
            otherwise: (schema) => schema,
        }),


    instanceTypeId: Yup.string()
        .required(msg.instanceTypeRequired),

    workflowName: Yup.string()
        .required(msg.workflowNameRequired)
        .max(100, msg.maximumLimit100),

    description: Yup.string()
        .required(msg.descriptionRequired)
        .max(255, msg.descriptionMax255),

    eventId: Yup.string()
        .required(msg.eventRequired),

    actionId: Yup.string()
        .required(msg.actionRequired),

    conditionId: Yup.string()
        .required(msg.conditionRequired)
});

export { ticketWorkflowSchema };
