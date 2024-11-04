import * as Yup from "yup"

const validationSchema = Yup.object({
    name: Yup.string()
        .max(250, "City name cannot exceed 250 characters.")
        .required("City name is required."),
    provinceId: Yup.string().required("Province is required.")
});



export { validationSchema };