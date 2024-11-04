import * as Yup from "yup";

const validationSchema = Yup.object({
    name: Yup.string()
    .required('Role name is required')
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name cannot be longer than 50 characters'),
description: Yup.string()
    .min(5, 'Description must be at least 5 characters')
    .max(255, 'Description cannot be longer than 255 characters'),
rights: Yup.object().test(
    'rights',
    'At least one permission per module must be selected',
    value => {
        if (!value) return false;
        return Object.values(value).every(module => 
            Object.values(module).some(permission => permission.checked)
        );
    }
)
});

export { validationSchema };
