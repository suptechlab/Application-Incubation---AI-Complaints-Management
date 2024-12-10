import React, { useEffect, useState } from "react";
import { Col, Modal, Row } from "react-bootstrap";
import LoginFormSection from "./loginFormSection";
import OtpFormSection from "./otpFormSection";
import SetupAccountSection from "./setupAccountSection";
import { useDispatch } from "react-redux";
import { sendLoginOTPonEmail } from "../../../redux/slice/authSlice";
import { useTranslation } from "react-i18next";

const LoginModal = ({ handleSignUpClick, handleLoginSucccesSubmit }) => {


    const dispatch = useDispatch()
    const { t } = useTranslation()
    const [isloginFormSubmitted, setIsloginFormSubmitted] = useState(false);
    const [otpToken, setOtpToken] = useState("")
    const [otpTokenExpirationTime, setOTPTokenExpirationTime] = useState('')

    useEffect(() => {
        if (otpTokenExpirationTime) {
            const expirationTime = new Date(otpTokenExpirationTime).getTime();
            const currentTime = Date.now();
            const timeLeft = expirationTime - currentTime;
            if (timeLeft > 0) {
                const timer = setInterval(() => {
                    const newTimeLeft = expirationTime - Date.now();
                    if (newTimeLeft <= 0) {
                        clearInterval(timer);
                        setIsloginFormSubmitted(false)
                    }
                }, 1000);
                return () => clearInterval(timer); // Clean up timer on unmount
            } else {
                setIsloginFormSubmitted(false)
            }
        }
    }, [otpTokenExpirationTime]);

    // Handle Login Form Submit
    const handleLoginFormSubmit = async (values, actions) => {
        // CALL SEND LOGIN OTP HERE AND THEN STARTS SET TIMEOUT FOR 15 MIN AFTER THAT OTP SCREEN WILL HIDE
        const result = await dispatch(sendLoginOTPonEmail(values));
        if (sendLoginOTPonEmail.fulfilled.match(result)) {
            setOtpToken(result?.payload?.otpToken)
            setOTPTokenExpirationTime(result?.payload?.otpTokenExpirationTime)
            actions.setSubmitting(false);
            setIsloginFormSubmitted(true);
            // toast.success(result?.message ?? "OTP Sent succesfully")
        } else {
            console.error('OTP Send error:', result.error.message);
            actions.setSubmitting(false);
        }
    };

    return (
        <React.Fragment>
            <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">
                <Modal.Title as="h4" className="fw-bold pt-1">
                    {t("FILE_A_CLAIM")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-break d-flex flex-column small pt-0">
                <div>
                    <Row className="pb-2 gy-4">
                        <Col lg>
                            <SetupAccountSection handleSignUpClick={handleSignUpClick} />
                        </Col>
                        <Col lg="auto" aria-hidden={true}>
                            <div className="border-black border-dashed border-end d-lg-block d-none h-100 opacity-100" />
                            <div className="border-black border-dashed border-top d-lg-none opacity-100 w-100" />
                        </Col>
                        <Col lg>
                            {isloginFormSubmitted ?
                                <OtpFormSection otpToken={otpToken} handleFormSubmit={handleLoginSucccesSubmit} /> :
                                <LoginFormSection handleFormSubmit={handleLoginFormSubmit} />}
                        </Col>
                    </Row>
                </div>
            </Modal.Body>
        </React.Fragment>
    );
};

export default LoginModal;
