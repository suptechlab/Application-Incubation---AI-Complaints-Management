import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

const ticketWorkflowSchema = Yup.object({

    entityId: Yup.string()
        .when(['userType', 'instanceTypeId'], {
            is: (userType, instanceTypeId) =>
                (userType === 'SYSTEM_ADMIN' || userType === 'SEPS_USER') && instanceTypeId === 'FIRST_INSTANCE',
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


    actions: Yup.array()
        .of(
            Yup.object().shape({
                actionId: Yup.string().required(msg.actionRequired),
                actionFilter1: Yup.string().required(msg.fieldRequired),
                actionFilter2: Yup.string().when('actionId', {
                    is: (value) =>
                        ['ASSIGN_TO_TEAM', 'MAIL_TO_FI_TEAM', 'MAIL_TO_SEPS_TEAM'].includes(value),
                    then: (schema) => schema.required(msg.fieldRequired),
                    otherwise: (schema) => schema.notRequired(),
                }),
                actionFilter3: Yup.string().when('actionId', {
                    is: (value) =>
                        ['MAIL_TO_FI_TEAM', 'MAIL_TO_SEPS_TEAM'].includes(value),
                    then: (schema) => schema.required(msg.fieldRequired),
                    otherwise: (schema) => schema.notRequired(),
                }),
            })
        )
        .min(1, msg.actionsRequired),

    conditions: Yup.array()
        .when('eventId', {
            is: (eventId) => eventId !== 'SLA_BREACH' && eventId !== 'TICKET_DATE_EXTENSION',
            then: (schema) => schema
                .of(
                    Yup.object().shape({
                        conditionId: Yup.string().required(msg.conditionRequired),
                        conditionCatId: Yup.string().when('eventId', {
                            is: 'CREATED',
                            then: (schema) => schema.required(msg.fieldRequired), // Required only for "CREATED"
                            otherwise: (schema) => schema, // Optional otherwise
                        }),
                    })
                ),
            otherwise: (schema) => schema
                .of(
                    Yup.object().shape({
                        conditionId: Yup.string(), // Optional
                        conditionCatId: Yup.string(), // Optional
                    })
                ),
        }),

});


export { ticketWorkflowSchema };
