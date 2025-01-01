import React, { useState, useCallback, useEffect } from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { ClaimDetailsFormSchema } from '../../../../validations/createClaim.validation';
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormCheckbox from "../../../../components/formCheckbox";
import { Link } from "react-router-dom";
import { claimTypesDropdownList, getClaimSubTypeById } from '../../../../services/claimSubType.service';
import FormOtpInputBox from '../../../../components/FormOtpInputBox';
import { svgIconClasses } from '@mui/material';
import { MdRefresh } from 'react-icons/md';
import AppTooltip from '../../../../components/tooltip';
import { FiInfo } from "react-icons/fi";
import { requestOTPApi, verifyOTPApi } from '../../../../services/claimcreate.services';
import toast from 'react-hot-toast';

const ClaimDetailsTab = ({ backButtonClickHandler, handleFormSubmit, setIsLoading }) => {

    const [fileName, setFileName] = useState("Fi_Users_data.xlsx");
    const { t } = useTranslation();
    const [claimTypes, setClaimTypes] = useState([]);
    const [claimSubTypes, setClaimSubTypes] = useState([]);


    const [isOTPFormSubmitted, setIsOTPFormSubitted] = useState(false)

    const [isFormEmailValidate , setIsFormEmailValidate] = useState(false)

    const [optSendStatus, setOptSendStatus] = useState(false)

    // Initial Values
    const initialValues = {
        claimTypeId: '',
        claimSubTypeId: '',
        precedents: '',
        specificPetition: '',
        attachments: '',
        agreeDeclarations: false,
        otpCode: ''
    };

    //Handle File Change
    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("Fi_Users_data.xlsx");
        }
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };

    // HANDLE RESEND OTP BUTTON
    const handleResend = async (email) => {
        // THIS STATE IS FOR SPINNING RESNED OTP BUTTON

        requestOTPApi({ email }).then((response) => {
            setOptSendStatus(true);
            toast.success("OTP has been resent successfully.");
        })
            .catch((error) => {
                if (error?.response?.data?.errorDescription) {
                    toast.error(error?.response?.data?.errorDescription);
                } else {
                    toast.error(error?.message);
                }
            }).finally(() => {
                setOptSendStatus(false);
            })


        // const isOtpSent = await sendOTP(email);
        // if (isOtpSent) {
        //   setOptSendStatus(false);
        //   toast.success("OTP has been resent successfully.");
        // } else {
        //   setOptSendStatus(false);
        // }
    };

    // HANDLE SEND OTP BUTTON
    const handleSendOTP = async (email) => {

        setIsOTPFormSubitted(true)
        // requestOTPApi({ email }).then((response) => {
        //     setOptSendStatus(true);
        //     setIsOTPFormSubitted(true)
        //     toast.success("OTP has been sent successfully.");
        // })
        //     .catch((error) => {
        //         if (error?.response?.data?.errorDescription) {
        //             toast.error(error?.response?.data?.errorDescription);
        //         } else {
        //             toast.error(error?.message);
        //         }
        //     }).finally(() => {
        //         setOptSendStatus(false);
        //     })
    }

    const handleOTPVerification = async (data)=>{
        setIsFormEmailValidate(true)
        // verifyOTPApi(data).then((response) => {
        //     setIsFormEmailValidate(true)
        //     toast.success("OTP Verified.");
        // })
        //     .catch((error) => {
        //         if (error?.response?.data?.errorDescription) {
        //             toast.error(error?.response?.data?.errorDescription);
        //         } else {
        //             toast.error(error?.message);
        //         }
        //     }).finally(() => {
        //         setOptSendStatus(false);
        //     })
    }

    const getClaimTypes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await claimTypesDropdownList();

            const claimFormatTypesList = response?.data?.map((data) => {
                return {
                    label: data?.name,
                    value: data?.id
                }
            })
            setClaimTypes(claimFormatTypesList);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }, [setClaimTypes, setIsLoading])

    const getClaimSubTypes = useCallback(async (claimId) => {
        setIsLoading(true);
        try {
            const response = await getClaimSubTypeById(claimId);
            const claimSubTypeFormatList = response?.data
                ? [{ label: response.data.name, value: response.data.id }]
                : [];
            setClaimSubTypes(claimSubTypeFormatList);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }, [setClaimSubTypes, setIsLoading])

    useEffect(() => {
        getClaimTypes();
    }, [getClaimTypes])

    return (
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow h-100">
            <Card.Body className="d-flex flex-column h-100">
                <CommonFormikComponent
                    // validationSchema={ClaimDetailsFormSchema}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    {(formikProps) => (
                        <React.Fragment>
                            <div className="text-break d-flex flex-column small pt-0">
                                <h6 className="mb-3 pb-1 fw-semibold">{t("CLAIM_DETAILS")}</h6>
                                <Row className="gx-4">
                                    <Col sm={6} lg={4}>
                                        <ReactSelect
                                            label={t("CLAIM_TYPE")}
                                            error={formikProps.errors.claimTypeId}
                                            options={claimTypes}
                                            value={formikProps.values.claimTypeId}
                                            onChange={(option) => {
                                                formikProps.setFieldValue("claimTypeId", option?.target?.value ?? "");
                                                formikProps.setFieldValue("claimSubTypeId", "");
                                                if (option?.target?.value && option?.target?.value !== "") {
                                                    if (option?.target?.value !== formikProps?.values?.claimTypeId) {
                                                        getClaimSubTypes(option?.target?.value);
                                                    }
                                                }
                                            }}
                                            name="claimTypeId"
                                            className={formikProps.touched.claimTypeId && formikProps.errors.claimTypeId ? "is-invalid" : ""}
                                            onBlur={formikProps.handleBlur}
                                            touched={formikProps.touched.claimTypeId}
                                        />
                                    </Col>
                                    <Col sm={6} lg={4}>
                                        <ReactSelect
                                            label={t("CLAIM_SUBTYPE")}
                                            error={formikProps.errors.claimSubTypeId}
                                            options={claimSubTypes}
                                            value={formikProps.values.claimSubTypeId}
                                            onChange={(option) => {
                                                formikProps.setFieldValue("claimSubTypeId", option?.target?.value ?? "");
                                            }}
                                            name="claimSubTypeId"
                                            className={formikProps.touched.claimSubTypeId && formikProps.errors.claimSubTypeId ? "is-invalid" : ""}
                                            onBlur={formikProps.handleBlur}
                                            touched={formikProps.touched.claimSubTypeId}
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <FormInputBox
                                            id="precedents"
                                            label={t("PRECEDENTS")}
                                            name="precedents"
                                            type="text"
                                            as="textarea"
                                            rows="3"
                                            error={formikProps.errors.precedents}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            touched={formikProps.touched.precedents}
                                            value={formikProps.values.precedents || ""}
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <FormInputBox
                                            id="specificPetition"
                                            label={t("SPECIFIC_PETITION")}
                                            name="specificPetition"
                                            type="text"
                                            as="textarea"
                                            rows="3"
                                            error={formikProps.errors.specificPetition}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            touched={formikProps.touched.specificPetition}
                                            value={formikProps.values.specificPetition || ""}
                                        />
                                    </Col>
                                    <Col xs={12} className="mb-3 py-1">
                                        <div className="theme-upload-cover d-inline-flex align-items-center gap-3">
                                            <div className="overflow-hidden position-relative z-1 flex-shrink-0">
                                                <label
                                                    htmlFor="files"
                                                    className="btn btn-warning"
                                                >
                                                    {t("UPLOAD_OPTIONAL_ATTACHMENTS")}
                                                </label>
                                                <input
                                                    id="files"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            <span className="opacity-75">Multiple attachment can be uploaded.</span>
                                        </div>
                                        {fileName && (
                                            <div className="pt-1">
                                                <Link
                                                    target="_blank"
                                                    to="/fi-users/import"
                                                    className="text-decoration-none mw-100 text-break"
                                                >
                                                    {fileName}
                                                </Link>
                                            </div>
                                        )}
                                    </Col>
                                    <Col xs={12}>
                                        <Stack direction="horizontal" gap={2} className="mb-3 flex-wrap">
                                            <h5 className="custom-font-size-18 mb-0 fw-bold">
                                                {t("EMAIL_VERIFICATION")}
                                            </h5>
                                            <AppTooltip title={t("EMAIL_VERIFICATION")}>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="p-0 border-0 link-dark"
                                                >
                                                    <FiInfo size={22} />
                                                </Button>
                                            </AppTooltip>
                                        </Stack>
                                    </Col>

                                    {!isOTPFormSubmitted || isFormEmailValidate ? (
                                        <Col xs={12}>
                                            <Row>
                                                <Col sm lg={4}>
                                                    <FormInputBox
                                                        autoComplete="off"
                                                        id="email"
                                                        label={t("EMAIL ADDRESS")}
                                                        name="email"
                                                        type="email"
                                                        error={formikProps.errors.email}
                                                        onBlur={formikProps.handleBlur}
                                                        onChange={formikProps.handleChange}
                                                        touched={formikProps.touched.email}
                                                        value={formikProps.values.email || ""}
                                                        readOnly={isFormEmailValidate ?? false}
                                                        inputIcon={
                                                            isFormEmailValidate && (
                                                                <span className="text-success position-absolute top-0 end-0 p-1 custom-width-42 h-100 d-inline-flex align-items-center justify-content-center pe-none user-select-none">
                                                                    {svgIconClasses.checkBadgeIcon}
                                                                </span>
                                                            )
                                                        }
                                                        inputClassName={
                                                            isFormEmailValidate && "custom-padding-right-42"
                                                        }
                                                    />
                                                </Col>
                                                {!isFormEmailValidate && (
                                                    <Col xs="auto" lg className="pt-sm-4 mb-3 pb-1">
                                                        <Button
                                                            type="submit"
                                                            variant="warning"
                                                            className="custom-min-width-100 custom-margin-top-1"
                                                            onClick={handleSendOTP}
                                                        // disabled={formikProps?.isSubmitting ?? false}
                                                        >
                                                            {t("SEND_OTP_BUTTON")}
                                                        </Button>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Col>
                                    ) : (
                                        <Col xs={12}>
                                            <p className="mb-4 mt-n2">
                                                {t("FORM_INSTRUCTION")}
                                            </p>
                                            <Row>
                                                <Col sm lg={4}>
                                                    <FormOtpInputBox
                                                        value={formikProps.values.otpCode}
                                                        numInputs={6}
                                                        inputStyle={{
                                                            width: "50px",
                                                            height: "42px",
                                                        }}
                                                        onChange={(event) => {
                                                            formikProps.setFieldValue("otpCode", event);
                                                        }}
                                                        onBlur={formikProps.handleBlur}
                                                        error={formikProps.errors.otpCode}
                                                        touched={formikProps.touched.otpCode}
                                                    />
                                                </Col>
                                                <Col xs className="mb-3 pb-1">
                                                    <Button
                                                        type="button"
                                                        variant="warning"
                                                        className="custom-min-width-100 custom-margin-top-1"
                                                        onClick={handleOTPVerification}
                                                    >
                                                        {t("OTP_VERIFICATION")}
                                                    </Button>
                                                </Col>
                                                <Col xs={12}>
                                                    <Button
                                                        type="button"
                                                        variant="link"
                                                        className="fw-semibold text-decoration-none p-0 border-0"
                                                        onClick={() => {
                                                            formikProps.setFieldValue("otpCode", "");
                                                            handleResend(formikProps?.values?.email)
                                                        }
                                                        }
                                                    >
                                                        <span className="me-1">
                                                            <MdRefresh
                                                                size={21}
                                                                className={optSendStatus ? "spin" : ""}
                                                            />
                                                        </span>{" "}
                                                        {t("RESEND_OTP")}
                                                    </Button>
                                                    <p className="pt-3 mb-0 fst-italic custom-font-size-12">
                                                        {t("OTP_INSTRUCTION")}
                                                    </p>
                                                </Col>
                                            </Row>
                                        </Col>
                                    )}

                                    <Col xs={12}>
                                        <FormCheckbox
                                            wrapperClassName="mb-0"
                                            className='fs-6 fw-medium'
                                            id="agreeDeclarations"
                                            checked={formikProps.values.agreeDeclarations}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            touched={formikProps.touched.agreeDeclarations}
                                            error={formikProps.errors.agreeDeclarations}
                                            type="checkbox"
                                            label={t("AGREE_DECLARATIONS")}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="theme-from-footer mt-auto border-top px-3 mx-n3 pt-3">
                                <Stack
                                    direction="horizontal"
                                    gap={3}
                                    className="justify-content-end flex-wrap"
                                >

                                    <Button
                                        type="button"
                                        variant="outline-dark"
                                        onClick={backButtonClickHandler}
                                        className="custom-min-width-85"
                                    >
                                        {t('BACK')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        className="custom-min-width-85"
                                    >
                                        {t("FINISH")}
                                    </Button>
                                </Stack>
                            </div>
                        </React.Fragment>

                    )}
                </CommonFormikComponent>
            </Card.Body>
        </Card>
    )
}

export default ClaimDetailsTab