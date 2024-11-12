import React, { useState } from "react";
import { Button, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { MdRefresh } from "react-icons/md";
import CommonFormikComponent from "../../../components/CommonFormikComponent";
import FormOtpInputBox from "../../../components/formOtpInput";
import { OtpFormSchema } from "../validations";

const OtpFormSection = ({ handleFormSubmit }) => {
    const [optSendStatus, setOptSendStatus] = useState(false);

    // Initial Values
    const initialValues = {
        otpCode: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };


    // Handle Resend OTP 
    const handleResend = () => {
        setOptSendStatus(true)
        try {
            setOptSendStatus(false)
            toast.success("OTP has been resent successfully.");
        } catch (error) {
            toast.error("Failed to resend OTP. Please try again.");
            setOptSendStatus(false)
        }
    }

    return (
        <CommonFormikComponent
            validationSchema={OtpFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <h6 className="fw-bold">For Existing User ?</h6>
                    <div className="fw-semibold mb-2">Verify your Email</div>
                    <p>We've sent a One-Time Password (OTP) to your email address. Please enter it below to verify.</p>
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
                            onClick={handleResend}
                        >
                            <span className="me-1"><MdRefresh size={21} className={optSendStatus ? 'spin' : ''} /></span>Resend OTP
                        </Button>
                        <Button
                            type="submit"
                            variant="warning"
                            className="custom-min-width-100 ms-auto"
                        >
                            Verify OTP
                        </Button>
                    </Stack>
                    <p className="mb-0 pt-3 fst-italic">Didn't receive the OTP? Check your spam folder or click "Resend OTP" to get a new code.</p>
                </React.Fragment>
            )}
        </CommonFormikComponent>
    );
};

export default OtpFormSection;
