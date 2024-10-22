import { Formik } from 'formik';
import React, { useRef, useState } from 'react';
import { Button, Card, Col, Image, Row, Stack } from "react-bootstrap";

import FormInput from '../../components/FormInput';
import { handleForgotPassword } from '../../services/authentication.service';
import { validationSchema } from '../../validations/forgotPassword.validation';

import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Captcha from '../../components/Captcha';
import "./ForgotPassword.scss";
import Logo from "../../assets/images/logo.png"
// import ForgotPasswordBanner from "../../assets/images/forgot-banner.png";
import ForgotPasswordBanner from "../../assets/images/banner.png";
import { IoIosArrowRoundBack } from "react-icons/io";


export default function ForgotPassword() {
    const [captcha, setCaptcha] = useState('')
    const reCaptchaRef = useRef(null);
    const navigate = useNavigate()

    const onSubmit = async (values, actions) => {
        // if (captcha === '') {
        //     toast.error('Please enter the captcha')
        //     return
        // }
        await handleForgotPassword({ ...values }).then((response) => {
            toast.success(response.data.message)
            actions.resetForm()
            navigate('/reset-password')
            //reCaptchaRef.current.reset()
            //setCaptcha("")
        }).catch((error) => {
            console.log(error.response.data.message)
            toast.error(error.response.data.message);

        }).finally(() => {
            actions.setSubmitting(false)
        })
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
                                    />
                                </Link>
                                
                            </div>
                            <h3 className="fw-semibold mb-0">
                                Forgot Password
                            </h3>
                            <p className="text-secondary mb-3">
                                Please enter your registered email address.
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
                                        placeholder="Enter email"
                                        type="text"
                                        label="Email Address *"
                                        value={values.email}
                                        error={errors.email}
                                        touched={touched.email}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                    />

                                    {/* <div>
                                        <Captcha
                                            reCaptchaRef={reCaptchaRef}
                                            onChangeCaptchaCode={(
                                                value
                                            ) => {
                                                setCaptcha(value);
                                            }}
                                        />
                                    </div> */}
                                    <Stack
                                        direction="horizontal"
                                        gap={3}
                                        className="justify-content-md-end   mt-3"
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
                                                    className="spinner-border  spinner-border-sm"
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
                                </>
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
                            src={ForgotPasswordBanner}
                            alt="Forgot Password Banner"
                        />
                        <Card.ImgOverlay className="auth-bg-gradient"></Card.ImgOverlay>

                    </Card>
                </Col>
            </Row>
        </React.Fragment>

    );
}
