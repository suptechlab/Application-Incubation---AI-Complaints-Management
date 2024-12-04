import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

const validationSchema = Yup.object({

  entityId: Yup.string()
    .when('entityType', {
      is: "FI",
      then: (schema) => schema
        .required(msg.entityRequired),
      otherwise: (schema) => schema,
    }),

  teamName: Yup.string()
    .required(msg.teamNameRequired) // Dynamic message for name required
    .max(100, msg.maximumLimit100), // Dynamic message for max length

  description: Yup.string()
    .required(msg.descriptionRequired) // Dynamic message for email required
    .max(255, msg.descriptionMax255), // Dynamic message for max length
});

export { validationSchema };
