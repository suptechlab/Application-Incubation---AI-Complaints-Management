import { Form as FormikForm, Formik } from "formik";
import React, { useContext, useRef, useState } from "react";
import AuthBanner from "../../assets/images/banner.png";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { handleResendOTP } from '../../services/authentication.service';
import { OtpValidationSchema } from "../../validations/login.validation";
import toast from "react-hot-toast";
import { Stack, Form, Image, Button, Col, Row, Spinner } from "react-bootstrap";
import Logo from "../../assets/images/logo.svg"
import {Link, useLocation, useNavigate } from 'react-router-dom';
import OtpInput from 'react-otp-input';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useTranslation } from "react-i18next";

export default function Otp() {
    const { t } = useTranslation(); // use the translation hook
    const location = useLocation();
    const { login, OtpVerify } = useContext(AuthenticationContext);
    const reCaptchaRef = useRef(true);
    const navigate = useNavigate()
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
            
            let res = await handleResendOTP(data);
            toast.success("OTP enviado con éxito.");
        } catch (error) {
            toast.error(error.response.data.errorDescription ?? "No se pudo reenviar el OTP. Inténtalo nuevamente.");
            navigate("/login")
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
                                <h3 className="fw-semibold mb-1 fs-26">{t('ONE TIME PASSWORD')}</h3>
                                <p className="text-body opacity-50 mb-4 pb-1 lh-sm">{t('WE VE SENT A ONE-TIME PASSWORD (OTP)')}</p>
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
                                                            <span className="visually-hidden">{t('LOADING')}...</span>
                                                        </Spinner>
                                                    ) : (
                                                        "Verificar OTP"
                                                    )}
                                                </Button>
                                            </Stack>
                                            <Form.Group className="small">
                                            {t('DIDN T RECEIVE THE CODE')}
                                                <Link className="fw-semibold text-decoration-none" onClick={handleResend}> {t('RESEND CODE')} </Link>
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
