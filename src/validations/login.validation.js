import * as Yup from "yup";

const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;


const validationSchema = Yup.object({
    email: Yup.string()
        .matches(emailRegExp, "Email must be a valid email")
        .required("Email is required.").max(100, "Maximum limit is 100"),
    password: Yup.string().required("Password is required.").max(100, "Maximum limit is 100")

});

// OTP validation
const OtpValidationSchema = Yup.object().shape({
    //email_type: Yup.string().required('Pleae select email type'),
    otpCode: Yup.string()
    .required("OTP is required.")
    .matches(/^\d{6}$/, "OTP max 6 digits and only numbers")
  });

export { validationSchema, OtpValidationSchema };
