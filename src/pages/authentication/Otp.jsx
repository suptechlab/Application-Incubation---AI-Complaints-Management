import { Formik, Form as FormikForm } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Image, Row, Spinner, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { IoIosArrowRoundBack } from "react-icons/io";
import OtpInput from 'react-otp-input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthBanner from "../../assets/images/banner.png";
import Logo from "../../assets/images/logo.svg";
import { AuthenticationContext } from "../../contexts/authentication.context";
import { handleResendOTP } from '../../services/authentication.service';
import { getLocalStorage } from "../../utils/storage";
import { OtpValidationSchema } from "../../validations/login.validation";

export default function Otp() {
    const { t } = useTranslation(); // use the translation hook
    const location = useLocation();
    const { OtpVerify } = useContext(AuthenticationContext);

    const navigate = useNavigate();
    const [otpToken] = useState(location?.state?.otpToken ? location?.state?.otpToken : '');

    // HANDLE OTP SUBMIT
    const onSubmit = async (values, actions) => {
        values.otpToken = otpToken;
        await OtpVerify({ ...values },actions);
    };

    // handle resend otp 
    const handleResend = async () => {
        let data = {
            'otpToken': otpToken
        }
        handleResendOTP(data).then((response) => {
            toast.success(response?.data?.message)
        }).catch((error) => {
            toast.error(error?.response?.data?.errorDescription);
            navigate("/login")
        });
    }

    useEffect(() => {
        if (getLocalStorage("access_token")) {
            navigate('/dashboard');
        }
    }, [])


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
                                    onSubmit={(values, actions) => {
                                        actions.setSubmitting(true)
                                        onSubmit(values, actions)
                                    }}
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
                                                    numInputs={6}
                                                    inputStyle={{
                                                        width: "42px",
                                                        height: "42px",
                                                    }}
                                                    containerStyle={{
                                                        justifyContent: "space-between"
                                                    }}
                                                    renderInput={(props) => (
                                                        <input {...props} className="form-control" />
                                                    )}

                                                    onChange={(event) => { setFieldValue("otpCode", event) }}
                                                />
                                                {errors?.otpCode && touched?.otpCode && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors?.otpCode}
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
                                                    // disabled={true}
                                                    disabled={isSubmitting === true ? true : false}
                                                    onClick={handleSubmit}
                                                >
                                                    {isSubmitting ? (
                                                        <Spinner size="sm" animation="border" role="output" className="align-middle me-1">
                                                            <span className="visually-hidden">{t('LOADING')}...</span>
                                                        </Spinner>
                                                    ) : (
                                                        t('VERIFY_OTP')
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
