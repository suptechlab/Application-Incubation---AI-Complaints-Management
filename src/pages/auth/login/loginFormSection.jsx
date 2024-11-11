import React from "react";
import { Button, Stack } from "react-bootstrap";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormInputBox from "../../../components/FormInput";
import { LoginFormSchema } from "../validations";

const LoginFormSection = ({ handleFormSubmit }) => {
    // Initial Values
    const initialValues = {
        email: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };

    return (
        <CommonFormikComponent
            validationSchema={LoginFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <h6 className="fw-bold">For Existing User ?</h6>
                    <p>To file a claim, please login to your account.</p>
                    <FormInputBox
                        wrapperClassName="mb-3"
                        autoComplete="off"
                        id="email"
                        label="Email Address"
                        name="email"
                        type="email"
                        error={formikProps.errors.email}
                        onBlur={formikProps.handleBlur}
                        onChange={formikProps.handleChange}
                        touched={formikProps.touched.email}
                        value={formikProps.values.email || ""}
                    />
                    <Stack direction="horizontal" gap={3} className="flex-wrap">
                        <Button
                            type="submit"
                            variant="warning"
                            className="custom-min-width-100 ms-auto"
                        >
                            Send OTP
                        </Button>
                    </Stack>
                </React.Fragment>
            )}
        </CommonFormikComponent>
    );
};

export default LoginFormSection;
