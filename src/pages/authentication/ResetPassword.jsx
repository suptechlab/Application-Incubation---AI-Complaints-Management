import { Formik } from 'formik'
import React from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Stack, Card, Form, Image, Button, Col, Row } from "react-bootstrap";


import FormInput from '../../components/FormInput'
import { handleResetPassword } from '../../services/authentication.service'
import { validationSchema } from '../../validations/resetPassword.validation'
import Logo from "../../assets/images/logo.png"
// import AuthBanner from "../../assets/images/login-banner.png";
import AuthBanner from "../../assets/images/banner.png";

import "./ResetPassword.scss"
import { IoIosArrowRoundBack } from "react-icons/io";

export default function ResetPassword() {
    const location = useLocation()
    const navigate = useNavigate()
    const onSubmit = async (values, actions) => {
        // const token = location.search.split("=")[1]
        // if (!token) {
        //     toast.error("Invalid token")
        //     return
        // }
        console.log('values', values)
        let data = {
            'key': values.otp,
            'newPassword': values.password,
        };

        await handleResetPassword(data).then((response) => {
            toast.success(response.data.message)
            navigate('/login', { replace: true })
        }).catch((error) => {
            toast.error(error.response.data.message)
        })
    }

    const handleBackClick = () => {
        navigate('/forgot-password'); 
    };


    return (


        <React.Fragment>
            {/* <Loader isLoading={loading} /> */}
            <Row className="g-0 vh-100 position-relative z-1 bg-white">
                <Col md className="h-100 overflow-auto">
                    <Row className="justify-content-center g-0 align-items-center h-100">
                        <Col md={10} xxl={8} className="p-4 py-md-5">
                            <div onClick={handleBackClick} className='fs-15 d-flex back-btn align-items-center mb-3 pb-3'>
                                <span><IoIosArrowRoundBack size={30} />
                                </span>
                                Back
                            </div>
                            <div className="mb-3 pb-1">
                                <Link to="/" className="d-inline-block">
                                    <Image
                                        className="img-fluid"
                                        src={Logo}
                                        alt={`Logo`}
                                        width={67}
                                        height={64}
                                    />
                                </Link>
                                
                            </div>
                            <h3 className="fw-semibold mb-0 " >
                                Reset Password

                            </h3>
                            <p className="text-secondary  mb-3">
                                Please enter new password.
                            </p>

                            <Formik
                                initialValues={{
                                    password: "",
                                    confirmPassword: "",
                                    otp: ""
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
                                    <>

                                        <FormInput
                                            error={errors.otp}
                                            id="otp"
                                            key={'otp'}
                                            label="OTP"
                                            name="otp"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Enter OTP"
                                            touched={touched.otp}
                                            type="password"
                                            value={values.otp}
                                        />

                                        <FormInput
                                            error={errors.password}
                                            id="password"
                                            key={'password'}
                                            label="New Password"
                                            name="password"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Enter New Password"
                                            touched={touched.password}
                                            type="password"
                                            value={values.password}
                                        />

                                        <FormInput
                                            error={errors.confirmPassword}
                                            id="confirmPassword"
                                            key={'confirmPassword'}
                                            label="Confirm New Password"
                                            name="confirmPassword"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Enter confirm password"
                                            touched={touched.confirmPassword}
                                            type="password"
                                            value={values.confirmPassword}
                                        />



                                        <Stack
                                            direction="horizontal"
                                            gap={3}
                                            className="justify-content-end"
                                        >
                                            <Button
                                                className="custom-min-width-100 fw-semibold text-nowrap"
                                                variant="primary"
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
                                    </>
                                )}
                            </Formik>
                        </Col>
                    </Row>
                </Col>
                <Col
                    md={7}

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
