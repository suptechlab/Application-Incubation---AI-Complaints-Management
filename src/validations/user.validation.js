import * as Yup from "yup";

const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validationSchema = Yup.object({
    //first_name: Yup.string().required("First name is required").transform((value) => value.trim()).min(2, "FIRST_NAME_MIN_MSG").max(20, "FIRST_NAME_MAX_MSG"),
     name: Yup.string().required("Name is required").max(100, "Maximum limit is 100"),
     email: Yup.string().matches(emailRegExp, "Email must be a valid email").required("Email is required").max(100, "Maximum limit is 100"),
    //  roleId: Yup.string().required("Role is required"),
     //mobileCode: Yup.string(),
     //mobileNo: Yup.string().required("Mobile number is required").min(10, "Invalid phone number").max(10, "Maximum limit is 10"),
    //  companyId: Yup.string().required("Company is required"),
    
     activated: Yup.boolean(),
});

export { validationSchema };
