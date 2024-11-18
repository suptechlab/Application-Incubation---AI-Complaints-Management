import React, { useRef, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormInputBox from "../../../components/FormInput";
import { LoginFormSchema } from "../validations";
import Captcha from "../../../components/Captcha";
import FormCheckbox from "../../../components/formCheckbox";

const LoginFormSection = ({ handleFormSubmit }) => {
    // Initial Values
    const initialValues = {
        email: '',
        rememberMe : false
    };


    const [captcha, setCaptcha] = useState('')
    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        values.recaptchaToken = captcha
        handleFormSubmit(values, actions);
    };
    const reCaptchaRef = useRef(null);

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
                     <FormCheckbox
                        id="rememberMe"
                        checked={formikProps.values.rememberMe}
                        onBlur={formikProps.handleBlur}
                        onChange={formikProps.handleChange}
                        type="checkbox"
                        label="Remember Me"
                    />
                    <Captcha
                        reCaptchaRef={reCaptchaRef}
                        onChangeCaptchaCode={(
                            value
                        ) => {
                            setCaptcha(value);
                        }}
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
