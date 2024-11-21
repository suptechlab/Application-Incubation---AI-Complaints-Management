import { Formik } from 'formik'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Stack, Form, Image, Button, Col, Row, Spinner } from "react-bootstrap";
import FormInput from '../../components/FormInput'
import { handleResetPassword } from '../../services/authentication.service'
import { validationSchema } from '../../validations/resetPassword.validation'
import Logo from "../../assets/images/logo.svg"
import AuthBanner from "../../assets/images/banner.png";
import { IoIosArrowRoundBack } from "react-icons/io";
import Captcha from '../../components/Captcha';
import { useTranslation } from "react-i18next";

export default function ResetPassword() {

    const { t } = useTranslation(); // use the translation hook
    const [captcha, setCaptcha] = useState('')
    const reCaptchaRef = useRef(null);
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();
    const [otpToken, setOtpToken] = useState(searchParams.get("key"));
    
    // console.log('otpToken=',otpToken)

    const onSubmit = async (values, actions) => {
        if (captcha === "") {
            toast.error("Please enter the captcha");
            return;
        }
        // const token = location.search.split("=")[1]
        // if (!token) {
        //     toast.error("Invalid token")
        //     return
        // }
        console.log('values', values)
        let data = {
            'key': otpToken,
            'newPassword': values.password,
            'recaptchaToken': captcha != '' ? captcha : '' 
        };

        await handleResetPassword(data).then((response) => {
            toast.success(response.data.message)
            navigate('/login', { replace: true })
        }).catch((error) => {
            toast.error(error.response.data.errorDescription ? error.response.data.errorDescription : t('SOMETHING WENT WRONG'))
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
                                <Link to="/forgot-password" className='fw-semibold d-inline-block align-middle mb-5 text-decoration-none'>
                                    <IoIosArrowRoundBack size={28} /> {t('BACK')}
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
                                <h3 className="fw-semibold mb-1 fs-26">
                                Restablecer contraseña
                                </h3>
                                <p className="text-body opacity-50 mb-4 pb-1 lh-sm">
                                Introducir nueva contraseña
                                </p>
                                <Formik
                                    initialValues={{
                                        password: "",
                                        confirmPassword: "",
                                        //otp: ""
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
                                                error={errors.password}
                                                id="password"
                                                key={'password'}
                                                label="Nueva contraseña *"
                                                name="password"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                touched={touched.password}
                                                type="password"
                                                value={values.password}
                                            />

                                            <FormInput
                                                error={errors.confirmPassword}
                                                id="confirmPassword"
                                                key={'confirmPassword'}
                                                label="Confirmar nueva contraseña *"
                                                name="confirmPassword"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                touched={touched.confirmPassword}
                                                type="password"
                                                value={values.confirmPassword}
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
                                                            <span className="visually-hidden">{t('LOADING')}...</span>
                                                        </Spinner>
                                                    ) : (
                                                        t('SUBMIT')
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
                        src={AuthBanner}
                        alt="Reset Password Banner"
                    /> 
                </Col>
            </Row>
        </React.Fragment>

    );
}
