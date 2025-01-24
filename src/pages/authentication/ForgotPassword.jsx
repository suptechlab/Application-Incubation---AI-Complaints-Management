import { Formik } from 'formik';
import React, { useRef, useState } from 'react';
import { Button, Col, Form, Image, Row, Spinner, Stack } from "react-bootstrap";
import FormInput from '../../components/FormInput';
import { handleForgotPassword } from '../../services/authentication.service';
import { validationSchema } from '../../validations/forgotPassword.validation';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Captcha from '../../components/Captcha';
import Logo from "../../assets/images/logo.svg"
import ForgotPasswordBanner from "../../assets/images/banner.png";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
    const { t } = useTranslation(); // use the translation hook
    const [captcha, setCaptcha] = useState('')
    const reCaptchaRef = useRef(null);
    const navigate = useNavigate()

    const onSubmit = async (values, actions) => {
        if (captcha === "") {
            toast.error(t("ENTER_CAPTCHA"));
            return;
        }
        values.recaptchaToken = captcha !== '' ? captcha : ''
        await handleForgotPassword({ ...values }).then((response) => {
            toast.success(response.data.message)
            actions.resetForm()
            navigate('/login')
            //reCaptchaRef.current.reset()
            //setCaptcha("")
        }).catch((error) => {
            toast.error(error.response.data.errorDescription ? error.response.data.errorDescription : t('SOMETHING WENT WRONG'));

        }).finally(() => {
            actions.setSubmitting(false)
        })
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
                                    <IoIosArrowRoundBack size={28} /> {t('BACK')}
                                </Link>
                                <div className="mb-4 pb-1">
                                    <Link to="/login" className="d-inline-block">
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
                                    {t('FORGOT PASSWORD')}
                                </h3>
                                <p className="text-body opacity-50 mb-4 pb-1 lh-sm">
                                    {t('ENTER YOUR EMAIL ADDRESS FORGOT PASSWORD')}
                                </p>
                                <Formik
                                    initialValues={{
                                        email: '',
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
                                    }) => (<>
                                        <FormInput
                                            key={'email'}
                                            id="email"
                                            name="email"
                                            type="text"
                                            label={t('EMAIL ADDRESS')}
                                            value={values.email}
                                            error={errors.email}
                                            touched={touched.email}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                        />

                                        <Form.Group className="mb-4 pt-1">
                                            <Captcha
                                                reCaptchaRef={reCaptchaRef}
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
                                                        <span className="visually-hidden">{t("LOADING")}...</span>
                                                    </Spinner>
                                                ) : (
                                                     t('SEND')
                                                )}
                                            </Button>
                                        </Stack>
                                    </>
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
                        src={ForgotPasswordBanner}
                        alt="Forgot Password Banner"
                    /> 
                </Col>
            </Row>
        </React.Fragment>

    );
}
