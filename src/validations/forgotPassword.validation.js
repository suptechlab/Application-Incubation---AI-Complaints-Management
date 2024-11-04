import * as Yup from "yup";

const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const validationSchema = Yup.object({
    email: Yup.string()
        .matches(emailRegExp, "Email must be a valid email")
        .required("Email is required.").max(100, "Maximum limit is 100"),

});

export { validationSchema };
