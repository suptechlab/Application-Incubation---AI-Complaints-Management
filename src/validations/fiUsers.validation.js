import * as Yup from "yup";

const validationSchema = Yup.object({
  dataFile: Yup.string(),
  description: Yup.string(),
});

export { validationSchema };
