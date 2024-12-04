import React, { useEffect, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { MdRefresh } from "react-icons/md";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormOtpInputBox from "../../../components/formOtpInput";
import { OtpFormSchema } from "../validations";
import { resendLoginOTPonEmail } from "../../../redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

const OtpFormSection = ({ otpToken, handleFormSubmit }) => {
    const [optSendStatus, setOptSendStatus] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [timer, setTimer] = useState(0);

    const {t} = useTranslation()

    const dispatch = useDispatch()

    // Initial Values
    const initialValues = {
        otpCode: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        actions.setSubmitting(true)
        values.otpToken = otpToken
        // VERIFY OTP HERE
        handleFormSubmit(values, actions);
    };

    // Handle Resend OTP 
    const handleResend = async () => {
        setOptSendStatus(true);
        setIsResendDisabled(true);
        setTimer(60); // Start 60-second timer
        try {
            const result = await dispatch(resendLoginOTPonEmail(otpToken));

            if (resendLoginOTPonEmail.fulfilled.match(result)) {
                toast.success(result?.payload?.message || "OTP has been resent successfully.");
            } else {
                console.error('OTP Send error:', result.error.message);
                // toast.error("Failed to resend OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error during OTP resend:", error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setOptSendStatus(false);
        }
    };

    useEffect(() => {
        let countdown;
        if (timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setIsResendDisabled(false)
            clearInterval(countdown);
        }

        return () => clearInterval(countdown); // Cleanup on unmount
    }, [timer]);

    return (
        <CommonFormikComponent
            validationSchema={OtpFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <h6 className="fw-bold">{t('EXISTING_USER_PROMPT')}</h6>
                    <div className="fw-semibold mb-2">{t('VERIFY_EMAIL_LABEL')}</div>
                    <p>{t('OTP_SENT_INSTRUCTION')}</p>
                    <FormOtpInputBox
                        wrapperClassName="mb-3"
                        value={formikProps.values.otpCode}
                        numInputs={6}
                        inputStyle={{
                            width: "50px",
                            height: "42px",
                        }}
                        onChange={(event) => { formikProps.setFieldValue("otpCode", event) }}
                        onBlur={formikProps.handleBlur}
                        error={formikProps.errors.otpCode}
                        touched={formikProps.touched.otpCode}
                    />
                    <Stack direction="horizontal" gap={3} className="flex-wrap">
                        <Button
                            type="button"
                            variant="link"
                            className="fw-semibold text-decoration-none p-0 border-0"
                            onClick={()=>{handleResend(); formikProps.setFieldValue("otpCode", "");}}
                            disabled={isResendDisabled || timer > 0}
                        >
                            {timer > 0 ? `${t('RESEND_OTP_TIMER')} ${timer}s` : <>
                                <span className="me-1"><MdRefresh size={21} className={optSendStatus ? 'spin' : ''} /></span> {t('RESEND_OTP')}
                            </>}
                        </Button>
                        <Button
                            type="submit"
                            variant="warning"
                            className="custom-min-width-100 ms-auto"
                            disabled={formikProps?.isSubmitting ?? false}
                        >
                            {t('VERIFY_OTP')}
                        </Button>
                    </Stack>
                    <p className="mb-0 pt-3 fst-italic">{t('OTP_NOT_RECEIVED_INSTRUCTION')}</p>
                </React.Fragment>

            )}
        </CommonFormikComponent>
    );
};

export default OtpFormSection;
