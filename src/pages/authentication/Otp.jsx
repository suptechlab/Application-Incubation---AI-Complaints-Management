import { Form as FormikForm, Formik } from "formik";
import React, { useContext, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AuthBanner from "../../assets/images/banner.png";
import FormInput from "../../components/FormInput";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { handleResendOTP } from '../../services/authentication.service';
import { OtpValidationSchema } from "../../validations/login.validation";
import "./Otp.scss";
import Captcha from "../../components/Captcha";
import toast from "react-hot-toast";
import { Stack, Card, Form, Image, Button, Col, Row } from "react-bootstrap";
import Logo from "../../assets/images/logo.png"
import { useNavigate, useLocation } from 'react-router-dom';
import OtpInput from 'react-otp-input';
import { IoIosArrowRoundBack } from "react-icons/io";

export default function Otp() {
    const location = useLocation();
    const [captcha, setCaptcha] = useState("");
    const { login, OtpVerify } = useContext(AuthenticationContext);
    const reCaptchaRef = useRef(true);
    const [username, setUsername] = useState(location?.state?.username ? location?.state?.username : 'ongcadmin@yopmail.com');
    const [otp, setOtp] = useState("");
    const navigate = useNavigate()

    const onSubmit = async (values, actions) => {
        
        values.username = username;
        console.log('param',values)
        //values.otp = otp;
        await OtpVerify({ ...values });
        actions.setSubmitting(false);
    };

    // handle resend otp 
    const handleResend = async () => {
        try {
            let data = {
                'email': username
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
    const handleAddNewClick = () => {
        navigate('/login'); 
    };
    return (
        <React.Fragment>
            {/* <Loader isLoading={loading} /> */}
            <Row className="g-0 vh-100 position-relative z-1 bg-white">
                <Col md className="h-100 overflow-auto">
                    <Row className="justify-content-center g-0  h-100 bg-white">
                        <Col md={10} xxl={7} className="p-4 mt-5 py-md-5">
                            <div  onClick={handleAddNewClick} className='fs-15 d-flex back-btn align-items-center mb-3 pb-3'>
                                <span><IoIosArrowRoundBack size={30}/>
                                </span>
                                Back
                            </div>
                            <div className="mb-3 pb-1">
                                <Link to="/" className="d-inline-block">
                                    <Image
                                        className="img-fluid"
                                        src={Logo}
                                        alt={`Logo`}
                                        width={60}
                                        height={60}
                                    />
                                </Link>
                                
                            </div>
                            <div className="fs-30 fw-semibold">One Time Password</div>
                            <div className="mb-4 pb-2">
                                Please enter the one time password (OTP) sent to <span className="fw-semibold">{username}</span>
                            </div>
                            <Formik
                                initialValues={{
                                    otp: ''
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
                                        <OtpInput
                                            value={values.otp}
                                            //onChange={setOtp()}
                                            numInputs={6}
                                            renderSeparator={<span></span>}
                                            inputStyle={{
                                              width:"42px",
                                              height:"42px",
                                              border: "1px solid #7F7F7F",
                                              borderRadius:"4px",
                                            }}
                                            containerStyle={{
                                            justifyContent:"space-between"
                                            }}
                                            renderInput={(props) => (
                                                <input {...props} />
                                            )}

                                            // errorsField={errors?.otp}
                                            // touched={touched?.otp}
                                            // handleChange={(event) => { setFieldValue("otp", event?.target?.value) }}
                                            onChange={(event) => { setFieldValue("otp", event) }}
                                        />
                                        {errors.otp && touched.otp && (
                                            <div className="invalid-feedback d-block">
                                                {errors.otp}
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center mt-5">
                                        <Form.Group className=" pb-1">
                                            <Row
                                                xs="auto"
                                                className="justify-content-between gx-0"
                                            >
                                                <Col>
                                                    <div className="fs-14 fw-normal">Didn’t receive the code?</div>
                                                    <Link
                                                        className="fs-14 fw-semibold text-light text-decoration-none"
                                                        onClick={handleResend}
                                                    >
                                                        Resend Code <span>
                                                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path d="M7.00383 15.3334C6.09038 15.3334 5.23366 15.1612 4.43366 14.8168C3.63366 14.4723 2.93644 14.0029 2.34199 13.4084C1.74755 12.814 1.2781 12.1168 0.933659 11.3168C0.589214 10.5168 0.416992 9.66676 0.416992 8.76676H2.51699C2.51699 10.0111 2.95199 11.0666 3.82199 11.9333C4.69199 12.8 5.75144 13.2334 7.00033 13.2334C8.24466 13.2334 9.30016 12.7984 10.1668 11.9284C11.0336 11.0584 11.467 9.99898 11.467 8.75009C11.467 7.50576 11.032 6.45026 10.162 5.58359C9.29199 4.71681 8.23255 4.28342 6.98366 4.28342H6.86699L7.76699 5.18342L6.65033 6.33342L3.55033 3.23342L6.65033 0.133423L7.76699 1.30009L6.88366 2.18342H6.98366C7.89788 2.18342 8.75421 2.35564 9.55266 2.70009C10.3511 3.04453 11.0503 3.51398 11.6503 4.10842C12.2503 4.70287 12.7225 5.39764 13.067 6.19276C13.4114 6.98787 13.5837 7.84064 13.5837 8.75109C13.5837 9.66153 13.4114 10.5168 13.067 11.3168C12.7225 12.1168 12.2531 12.814 11.6587 13.4084C11.0642 14.0029 10.3682 14.4723 9.57049 14.8168C8.77271 15.1612 7.91716 15.3334 7.00383 15.3334Z" fill="#0088FF"/>
                                                                                    </svg>
                                                        </span>
                                                    </Link>
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                        <Stack
                                            direction="horizontal"
                                            gap={3}
                                            className="justify-content-md-end "
                                        >
                                            <Button
                                                className="custom-min-width-100 fw-semibold text-nowrap"
                                                variant="info"
                                                type="submit"
                                                disabled={isSubmitting}
                                                onClick={handleSubmit}
                                            >
                                                {isSubmitting ? (
                                                    <div
                                                        className="spinner-border spinner-border-sm"
                                                        role="status"
                                                    >
                                                        <span className="sr-only">
                                                            Loading...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    "Submit"
                                                )}
                                            </Button>
                                        </Stack>
                                        </div>
                                    </FormikForm>
                                )}
                            </Formik>
                        </Col>
                    </Row>
                </Col>
                <Col
                    lg={7}
                    className="h-100 start-0 top-0 z-n1 order-md-first d-none d-xl-block"
                >
                    <Card className="h-100 text-white border-0">
                        <img
                            className="h-100 object-fit-cover w-100 banner-object"
                            src={AuthBanner}
                            alt="Login Banner"
                        />
                        <Card.ImgOverlay className="auth-bg-gradient"></Card.ImgOverlay>
                    </Card>
                </Col>
            </Row>
        </React.Fragment>
    );
}
