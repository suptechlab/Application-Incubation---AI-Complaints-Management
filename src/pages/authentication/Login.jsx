import { Form as FormikForm, Formik } from "formik";
import React, { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthBanner from "../../assets/images/banner.png";
import FormInput from "../../components/FormInput";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { validationSchema } from "../../validations/login.validation";
import Captcha from "../../components/Captcha";
import toast from "react-hot-toast";
import { Stack, Form, Image,Button,  Col, Row, Spinner } from "react-bootstrap";
import Logo from "../../assets/images/logo.svg"
import { useTranslation } from "react-i18next";


export default function Login() {
    const { t } = useTranslation(); // use the translation hook
    const [captcha, setCaptcha] = useState("");
    const { login } = useContext(AuthenticationContext);
    const reCaptchaRef = useRef(true);
    

    const onSubmit = async (values, actions) => {
        if (captcha === "") {
            toast.error("Please enter the captcha");
            return;
        }

        localStorage.setItem("langKey", "es");
        if (values.rememberMe) {
            values.rememberMe = true;
            localStorage.setItem("email", values.email);
            localStorage.setItem("password", values.password);
        } else {
            values.rememberMe = false;
            localStorage.removeItem("email");
            localStorage.removeItem("password");
            // localStorage.removeItem("langKey","es");
        }

        values.username = values.email
        values.recaptchaToken = captcha != '' ? captcha : '' 
        delete values.email;

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
                        <Row className="justify-content-center g-0 h-100 align-items-center">
                            <Col xs={12} className="p-4">
                                <div className="custom-max-width-320 w-100 m-auto">
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
                                    
                                    <h3 className="fw-semibold mb-1 fs-26">
                                        
                                        {t('SEPS ACCOUNT LOG IN')}
                                    </h3>
                                    <p className="text-body opacity-50 mb-4 pb-1 lh-sm">
                                        {t('PLEASE LOGIN TO CONTINUE YOUR ACCOUNT')}
                                    </p>
                                    <Formik
                                        initialValues={{
                                            email:
                                                localStorage.getItem("email") || "",
                                            password:
                                                localStorage.getItem("password") ||
                                                "",
                                            rememberMe: !!localStorage.getItem(
                                                "email"
                                            ),
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
                                                    label={t('EMAIL ADDRESS')}
                                                    name="email"
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    touched={touched.email}
                                                    type="text"
                                                    value={values.email || ""}
                                                />

                                                <FormInput
                                                    autoComplete="current-password"
                                                    error={errors.password}
                                                    id="password"
                                                    key={"password"}
                                                    label={t('PASSWORD')}
                                                    name="password"
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    touched={touched.password}
                                                    type="password"
                                                    value={values.password || ""}
                                                />
        
                                                <Form.Group className="mb-3 pb-1">
                                                    <Row
                                                        className="justify-content-between align-items-center"
                                                    >
                                                        <Col>
                                                            <Form.Check
                                                                id="rememberMe"
                                                                checked={values.rememberMe}
                                                                onBlur={handleBlur}
                                                                onChange={handleChange}
                                                                type="checkbox"
                                                                label="Acuérdate de mí"
                                                            />                                                    
                                                        </Col>
                                                        <Col xs="auto">
                                                            <Link
                                                                className="small fw-semibold text-decoration-none"
                                                                to="/forgot-password"
                                                            >
                                                                {t('FORGOT PASSWORD')}?
                                                                
                                                            </Link>                                                        
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <Captcha
                                                        reCaptchaRef={reCaptchaRef}
                                                        //sitekey="YOUR_RECAPTCHA_SITE_KEY" // Replace with your reCAPTCHA site key
                                                        onChangeCaptchaCode={(
                                                            value
                                                        ) => {
                                                            setCaptcha(value);
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Stack
                                                    direction="horizontal"
                                                    gap={3}
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
                                                            <span className="visually-hidden">{t('LOADING')}...</span>
                                                        </Spinner>
                                                    ) : (
                                                        t('LOGIN')
                                                    )}
                                                    </Button>
                                                </Stack>
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
                            alt="Login Banner"
                        /> 
                    </Col>
                </Row>
            </React.Fragment>
  
    );
}
