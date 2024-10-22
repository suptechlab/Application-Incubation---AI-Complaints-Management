import { Form as FormikForm, Formik } from "formik";
import React, { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthBanner from "../../assets/images/banner.png";
import FormInput from "../../components/FormInput";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { validationSchema } from "../../validations/login.validation";
import "./Login.scss";
import Captcha from "../../components/Captcha";
import toast from "react-hot-toast";
import { Stack,Card, Form, Image,Button,  Col, Row } from "react-bootstrap";
import Logo from "../../assets/images/logo.png"


export default function Login() {
    const [captcha, setCaptcha] = useState("");
    const { login, OtpVerify } = useContext(AuthenticationContext);
    const reCaptchaRef = useRef(true);

    const onSubmit = async (values, actions) => {
        if (captcha === "") {
            toast.error("Please enter the captcha");
            return;
        }

        if (values.rememberMe) {
            localStorage.setItem("email", values.email);
            localStorage.setItem("password", values.password);
            localStorage.setItem("langKey", "en");
        } else {
            localStorage.removeItem("email");
            localStorage.removeItem("password");
            localStorage.removeItem("langKey","en");
        }

        delete values.rememberMe;
        values.username = values.email
        values.recaptchaToken = captcha != '' ? captcha : '' 

        await login({ ...values });
        reCaptchaRef.current.reset();
        actions.setSubmitting(false);
        setCaptcha('')
    };

    return (
      

            <React.Fragment>
                {/* <Loader isLoading={loading} /> */}
                <Row className="g-0 vh-100 position-relative z-1 bg-white">
                    <Col md className="h-100 overflow-auto">
                        <Row className="justify-content-center g-0  h-100 bg-white">
                            <Col md={10} xxl={7} className="p-4 mt-5 py-md-5">
                                
                                <div className="mb-3 pb-1">
                                    <Link to="/" className="d-inline-block">
                                        <Image
                                            className="img-fluid"
                                            src={Logo}
                                            alt={`Logo`}
                                        />
                                    </Link>
                                    
                                </div>
                                
                                <p className="text-secondary mb-0">
                                    Welcome to
                                </p>
                                <h3 className="fw-semibold mb-3">
                                SEPS Account Log In
                                </h3>
                                <Formik
                                    initialValues={{
                                        email:
                                            localStorage.getItem("email") || "",
                                        password:
                                            localStorage.getItem("password") ||
                                            "",
                                        rememberMe: localStorage.getItem(
                                            "email"
                                        )
                                            ? true
                                            : false,
                                    }}
                                    validationSchema={validationSchema}
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
                                    }) => (
                                        <FormikForm>
                                            
                                            <FormInput
                                                autoComplete="username"
                                                error={errors.email}
                                                id="email"
                                                key={"email"}
                                                label="Email Address *"
                                                name="email"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                placeholder="Enter email"
                                                touched={touched.email}
                                                type="text"
                                                value={values.email || ""}
                                            />

                                            <FormInput
                                                autoComplete="current-password"
                                                error={errors.password}
                                                id="password"
                                                key={"password"}
                                                label="Password *"
                                                name="password"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                placeholder="Enter password"
                                                touched={touched.password}
                                                type="password"
                                                value={values.password || ""}
                                            />
    
                                            <Form.Group className="mb-3 pb-1">
                                                <Row
                                                    xs="auto"
                                                    className="justify-content-between gx-0"
                                                >
                                                    <Col>
                                                        <Form.Check
                                                            id="rememberMe"
                                                            checked={values.rememberMe}
                                                            onBlur={handleBlur}
                                                            onChange={handleChange}
                                                            className="fs-14 "
                                                            type="checkbox"
                                                            label="Remember Me"
                                                        />

                                                    
                                                    </Col>
                                                    <Col>
                                                        <Link
                                                            className="fs-14 fw-semibold text-light text-decoration-none"
                                                            to="/forgot-password"
                                                        >
                                                            Forgot Password?
                                                        </Link>
                                                        
                                                    </Col>
                                                </Row>
                                            </Form.Group>
                                            <div>
                                                <Captcha
                                                    reCaptchaRef={reCaptchaRef}
                                                    //sitekey="YOUR_RECAPTCHA_SITE_KEY" // Replace with your reCAPTCHA site key
                                                    onChangeCaptchaCode={(
                                                        value
                                                    ) => {
                                                        setCaptcha(value);
                                                    }}
                                                />
                                            </div>
                                            <Stack
                                                direction="horizontal"
                                                gap={3}
                                                className="justify-content-md-end   mt-3"
                                            >
                                                <Button
                                                    className="custom-min-width-85 fw-semibold text-nowrap"
                                                    variant="info"
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    onClick={handleSubmit}
                                                >
                                                    {isSubmitting ? (
                                                    <div
                                                        className="spinner-border  spinner-border-sm"
                                                        role="status"
                                                    >
                                                        <span className="sr-only">
                                                            Loading...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    "Login"
                                                )}
                                                </Button>


                                                
                                            </Stack>
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
