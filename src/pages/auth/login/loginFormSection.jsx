import React, { useRef, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormInputBox from "../../../components/FormInput";
import { LoginFormSchema } from "../validations";
import Captcha from "../../../components/Captcha";
import FormCheckbox from "../../../components/formCheckbox";
import { useTranslation } from "react-i18next";

const LoginFormSection = ({ handleFormSubmit }) => {
    const {t} = useTranslation()
    // Initial Values
    const initialValues = {
        email: '',
        rememberMe: false
    };


    const [captcha, setCaptcha] = useState('')
    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        actions.setSubmitting(true)
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
                    <h6 className="fw-bold">{t('EXISTING_USER_PROMPT')}</h6>
                    <p>{t('LOGIN_INSTRUCTION')}</p>
                    <FormInputBox
                        wrapperClassName="mb-3"
                        autoComplete="off"
                        id="email"
                        label={t('EMAIL_ADDRESS_LABEL')}
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
                        label={t('REMEMBER_ME_LABEL')}
                    />
                    <Captcha
                        reCaptchaRef={reCaptchaRef}
                        onChangeCaptchaCode={(value) => {
                            setCaptcha(value);
                        }}
                    />
                    <Stack direction="horizontal" gap={3} className="flex-wrap">
                        <Button
                            type="submit"
                            variant="warning"
                            className="custom-min-width-100 ms-auto mt-2"
                            disabled={formikProps?.isSubmitting}
                        >
                            {t('SEND_OTP_BUTTON')}
                        </Button>
                    </Stack>
                </React.Fragment>

            )}
        </CommonFormikComponent>
    );
};

export default LoginFormSection;
