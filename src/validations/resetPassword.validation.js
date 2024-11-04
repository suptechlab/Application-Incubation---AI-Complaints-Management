import * as Yup from "yup";


const validationSchema = Yup.object({
    password: Yup.string()
        .required("Password is required.")
        .max(16, "Maximum password limit is 16")
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            "Password must contain at least 8 characters, one uppercase, one number and one special case character"
        ),
    confirmPassword: Yup.string()
        .required("Confirm Password is required.")
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    otp: Yup.string()
        .required("OTP is required.")
        .matches(/^\d{6}$/, "OTP max 6 digits and only numbers")
});


export { validationSchema };
