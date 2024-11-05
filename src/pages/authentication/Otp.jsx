import { Form as FormikForm, Formik } from "formik";
import React, { useContext, useRef, useState } from "react";
import AuthBanner from "../../assets/images/banner.png";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { handleResendOTP } from '../../services/authentication.service';
import { OtpValidationSchema } from "../../validations/login.validation";
import toast from "react-hot-toast";
import { Stack, Form, Image, Button, Col, Row, Spinner } from "react-bootstrap";
import Logo from "../../assets/images/logo.svg"
import {Link, useLocation } from 'react-router-dom';
import OtpInput from 'react-otp-input';
import { IoIosArrowRoundBack } from "react-icons/io";

export default function Otp() {
    const location = useLocation();
    const { login, OtpVerify } = useContext(AuthenticationContext);
    const reCaptchaRef = useRef(true);
    const [username, setUsername] = useState(location?.state?.username ? location?.state?.username : 'admin@yopmail.com');
    const [otpToken, setOtpToken] = useState(location?.state?.otpToken ? location?.state?.otpToken : '');


    const onSubmit = async (values, actions) => {        
        //values.username = username;
        values.otpToken = otpToken;
        console.log('param',values)
        //values.otp = otp;
        await OtpVerify({ ...values });
        actions.setSubmitting(false);
    };

    // handle resend otp 
    const handleResend = async () => {
        try {
            let data = {
                'otpToken': otpToken
            }
            console.log('calling handleResendOTP with data:', data);
            let res = await handleResendOTP(data);
            console.log('handleResendOTP response:', res);
            toast.success("OTP has been resent successfully.");
        } catch (error) {
            console.error("Error in handleResend:", error);
            toast.error("Failed to resend OTP. Please try again.");
        }
    }

    return (
        <React.Fragment>
            {/* <Loader isLoading={loading} /> */}
            <Row className="g-0 vh-100 position-relative z-1 bg-white">
                <Col md className="h-100 overflow-auto">
                    <Row className="justify-content-center g-0 h-100 align-items-center">
                        <Col xs={12} className="p-4">
                            <div className="custom-max-width-320 w-100 m-auto">
                                <Link to="/login" className='fw-semibold d-inline-block align-middle mb-5 text-decoration-none'>
                                    <IoIosArrowRoundBack size={28} /> Back
                                </Link>
                                <div className="mb-4 pb-1">
                                    <Link to="/" className="d-inline-block">
                                        <Image
                                            className="img-fluid"
                                            src={Logo}
                                            alt={`SEPS Logo`}
                                            widht={225}
                                            height={48}
                                        />
                                    </Link>                                    
                                </div>
                                <h3 className="fw-semibold mb-1 fs-26">One Time Password</h3>
                                <p className="text-body opacity-50 mb-4 pb-1 lh-sm">We’ve sent a One-Time Password (OTP) to your email&nbsp;address. Please enter it below to verify.</p>
                                <Formik
                                    initialValues={{
                                        otpCode: ''
                                    }}
                                    validationSchema={OtpValidationSchema}
                                    onSubmit={onSubmit}
                                >
                                    {({
                                        errors,
                                        handleBlur,
                                        handleChange,
                                        handleSubmit,
                                        isSubmitting,
                                        touched,
                                        values,
                                        setFieldValue
                                    }) => (
                                        <FormikForm>
                                            <Form.Group className="mb-4 pb-2">
                                                <OtpInput
                                                    value={values.otpCode}
                                                    //onChange={setOtp()}
                                                    numInputs={6}
                                                    inputStyle={{
                                                        width:"42px",
                                                        height:"42px",
                                                    }}
                                                    containerStyle={{
                                                    justifyContent:"space-between"
                                                    }}
                                                    renderInput={(props) => (
                                                        <input {...props} className="form-control" />
                                                    )}

                                                    // errorsField={errors?.otp}
                                                    // touched={touched?.otp}
                                                    // handleChange={(event) => { setFieldValue("otp", event?.target?.value) }}
                                                    onChange={(event) => { setFieldValue("otpCode", event) }}
                                                />
                                                {errors.otpCode && touched.otpCode && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.otpCode}
                                                    </div>
                                                )}
                                            </Form.Group>
                                            
                                            <Stack
                                                direction="horizontal"
                                                gap={3}
                                                className="mb-3"
                                            >
                                                <Button
                                                    className="custom-min-width-85 text-nowrap"
                                                    variant="warning"
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    onClick={handleSubmit}
                                                >
                                                    {isSubmitting ? (
                                                        <Spinner size="sm" animation="border" role="output" className="align-middle me-1">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </Spinner>
                                                    ) : (
                                                        "Verify OTP"
                                                    )}
                                                </Button>
                                            </Stack>
                                            <Form.Group className="small">
                                                Didn’t receive the code? 
                                                <Link className="fw-semibold text-decoration-none" onClick={handleResend}> Resend Code </Link>
                                            </Form.Group>
                                        </FormikForm>
                                    )}
                                </Formik>
                            </div>
                        </Col>
                    </Row>
                </Col>
                <Col
                    md={6}
                    lg={7}
                    xxl={8}
                    className="h-100 order-md-first d-none d-md-block"
                >
                    <Image
                        className="h-100 object-fit-cover w-100"
                        src={AuthBanner}
                        alt="OTP Banner"
                    /> 
                </Col>
            </Row>
        </React.Fragment>
    );
}
