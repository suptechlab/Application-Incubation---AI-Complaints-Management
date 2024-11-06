import * as Yup from "yup";


const validationSchema = Yup.object({
    oldPassword: Yup.string()
        .required("Current Password is required.")
        .max(16, "Maximum password limit is 16")
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            "Password must contain at least 8 characters, one uppercase, one number and one special case character"
        ),
    newPassword: Yup.string()
        .required("New Password is required.")
        .max(16, "Maximum password limit is 16")
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            "Password must contain at least 8 characters, one uppercase, one number and one special case character"
        ),
    confirmPassword: Yup.string()
        .required("Confirm Password is required.")
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')

});

export { validationSchema };
