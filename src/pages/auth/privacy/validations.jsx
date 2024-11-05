import * as yup from "yup";

export const FormSchema = yup.object({
  firstName: yup.string().required().label("First Name"),
});
