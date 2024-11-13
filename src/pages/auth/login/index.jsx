import React, { useState } from "react";
import { Col, Modal, Row } from "react-bootstrap";
import LoginFormSection from "./loginFormSection";
import OtpFormSection from "./otpFormSection";
import SetupAccountSection from "./setupAccountSection";

const LoginModal = ({handleSignUpClick, handleLoginSucccesSubmit}) => {
    const [isloginFormSubmitted, setIsloginFormSubmitted] = useState(false);

    // Handle Login Form Submit
    const handleLoginFormSubmit = (values, actions) => {
        console.log('values', values)
        setIsloginFormSubmitted(true);
        actions.setSubmitting(false);
    };

    return (
        <React.Fragment>
            <Modal.Header closeButton className="align-items-start pb-2 pt-3 pe-3">
                <Modal.Title as="h4" className="fw-bold pt-1">
                    File a Claim
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-break d-flex flex-column small pt-0">
                <Row className="pb-2 gy-4">
                    <Col lg>
                        <SetupAccountSection handleSignUpClick={handleSignUpClick} />
                    </Col>
                    <Col lg="auto" aria-hidden={true}>
                        <div className="border-black border-dashed border-end d-lg-block d-none h-100 opacity-100" />
                        <div className="border-black border-dashed border-top d-lg-none opacity-100 w-100" />
                    </Col>
                    <Col lg>
                        {isloginFormSubmitted ? <OtpFormSection handleFormSubmit={handleLoginSucccesSubmit} /> : <LoginFormSection handleFormSubmit={handleLoginFormSubmit} />}
                    </Col>
                </Row>

            </Modal.Body>
        </React.Fragment>
    );
};

export default LoginModal;
