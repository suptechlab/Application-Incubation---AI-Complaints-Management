import * as Yup from "yup";
import { getValidationMessages } from "../services/Validation.service";

const msg = getValidationMessages();

const validationSchema = Yup.object({
    name: Yup.string()
        .required(msg.roleNameRequired) // Dynamic message for required role name
        .min(3, msg.roleNameMin3)       // Dynamic message for minimum length
        .max(50, msg.roleNameMax50),    // Dynamic message for maximum length

    description: Yup.string()
        .min(5, msg.descriptionMin5)    // Dynamic message for minimum length
        .max(255, msg.descriptionMax255), // Dynamic message for maximum length

    // rights: Yup.object().nullable().test(
    //     'rights',
    //     msg.rightsAtLeastOnePermission, // Dynamic message for rights permissions
    //     value => {
    //         // Allow `rights` to be null or undefined
    //         if (value == null) return true; 
    //         // Validate only if `rights` has a value
    //         return Object.values(value).every(module => 
    //             Object.values(module).some(permission => permission.checked)
    //         );
    //     }
    // ),
});

export { validationSchema };
