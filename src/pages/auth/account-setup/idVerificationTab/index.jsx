import React, { useState } from "react";
import { Button, Col, Row, Spinner, Stack } from "react-bootstrap";
import { FiInfo } from "react-icons/fi";
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormInputBox from "../../../../components/FormInput";
import SvgIcons from "../../../../components/SVGIcons";
import AppTooltip from "../../../../components/tooltip";
import { IdVerificationFormSchema } from "../../validations";
import { useDispatch } from "react-redux";
import { fingerPrintValidate, nationalIDVerificationStatus, nationalIdVerify } from "../../../../redux/slice/authSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const IdVerificationTab = ({ isSubmitted, setNewAccountData, newAccountData }) => {
    const { t } = useTranslation()
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const dispatch = useDispatch()
    // Initial Values
    const [initialValues] = useState({
        nationalID: '', // REMOVE THIS VALUE AFTER DEVELOPMENT
        fingerprintCode: '',
    });

    const [isIdVerified, setIsVerified] = useState(false)

    const [isVeifying, setVerifying] = useState(false)

    // Handle Submit Handler
    const handleSubmit = async (values, actions) => {

        // UNCOMMENT THIS CODE ONCE FINGERPRINT API STARTS
        actions.setSubmitting(true)
        const result = await dispatch(fingerPrintValidate({ identificacion: values?.nationalID, individualDactilar: values?.fingerprintCode }));
        if (fingerPrintValidate.fulfilled.match(result)) {
            if (result.payload === true) {
                isSubmitted(true);
                setNewAccountData((prev) => ({ ...prev, identificacion: values?.nationalID, individualDactilar: values?.fingerprintCode }))
                setIsFormSubmitted(true)
            } else {
                toast.error("Fingerprint not verified.")
            }
            actions.setSubmitting(false);
        } else {
            console.log("ARE YOU IN ELSE PART NA")
            setIsFormSubmitted(false)
            actions.setSubmitting(false);
        }

    };

    // Handle National ID Verification
    const handleNationalIdVerify = async (value) => {

        if (value && value !== '' && !isIdVerified) {
            setVerifying(true)
            const isVerifiedId = await dispatch(nationalIDVerificationStatus(value));

            if (isVerifiedId?.payload === true) {
                const result = await dispatch(nationalIdVerify(value));
                if (nationalIdVerify.fulfilled.match(result)) {
                    setIsVerified(true)
                    setNewAccountData((prev) => ({ ...prev, identificacion: value }))
                    setVerifying(false)
                } else {
                    console.error('Verification error:', result.error.message);
                    setVerifying(false)
                }
            } else {
                setVerifying(false)
                setNewAccountData((prev) => ({ ...prev, identificacion: '' }))
            }
        }
    };

    return (
        <CommonFormikComponent
            validationSchema={IdVerificationFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <Stack
                        direction="horizontal"
                        gap={2}
                        className="mb-3 flex-wrap"
                    >
                        <h5 className="custom-font-size-18 mb-0 fw-bold">{t("NATIONAL_ID_VERIFICATION")}</h5>
                        <AppTooltip
                            title={t("NATIONAL_ID_VERIFICATION")}
                        >
                            <Button
                                type="button"
                                variant="link"
                                className="p-0 border-0 link-dark"
                            >
                                <FiInfo size={22} />
                            </Button>
                        </AppTooltip>
                    </Stack>
                    <Row className="gx-4">
                        <Col lg>
                            <FormInputBox
                                autoComplete="off"
                                id="nationalID"
                                label={t("NATIONAL_ID_NUMBER")}
                                name="nationalID"
                                type="text"
                                error={formikProps.errors.nationalID}
                                onBlur={(event) => handleNationalIdVerify(event?.target?.value)}
                                onChange={(e) => {
                                    if (e.target.value !== formikProps.values.nationalID) {
                                        formikProps.handleChange(e);
                                        setIsVerified(false);
                                        setIsFormSubmitted(false)
                                    }

                                }}
                                touched={formikProps.touched.nationalID}
                                value={formikProps.values.nationalID || ""}
                                inputIcon={(isFormSubmitted || isIdVerified) && <span className="text-success position-absolute top-0 end-0 p-1 custom-width-42 h-100 d-inline-flex align-items-center justify-content-center pe-none user-select-none">{SvgIcons.checkBadgeIcon}</span>}
                                inputClassName={(isFormSubmitted || isIdVerified) && "custom-padding-right-42"}
                            />
                        </Col>
                        <Col lg>
                            <FormInputBox
                                autoComplete="off"
                                id="fingerprintCode"
                                label={t("FINGERPRINT_CODE")}
                                name="fingerprintCode"
                                type="text"
                                error={formikProps.errors.fingerprintCode}
                                onBlur={formikProps?.handleBlur}
                                onChange={(e) => {

                                    if (e.target.value !== formikProps.values.fingerprintCode) {
                                        formikProps.handleChange(e);
                                        setIsFormSubmitted(false)
                                    }

                                }}
                                touched={formikProps.touched.fingerprintCode}
                                value={formikProps.values.fingerprintCode || ""}
                                inputIcon={isFormSubmitted && <span className="text-success position-absolute top-0 end-0 p-1 custom-width-42 h-100 d-inline-flex align-items-center justify-content-center pe-none user-select-none">{SvgIcons.checkBadgeIcon}</span>}
                                inputClassName={isFormSubmitted && "custom-padding-right-42"}
                                disabled={!isIdVerified}
                            />
                        </Col>
                        <Col xs="auto" className="pt-lg-4">
                            <Button
                                type="submit"
                                variant="warning"
                                className="custom-min-width-90 custom-margin-top-1"
                                disabled={formikProps?.isSubmitting || isFormSubmitted || !isIdVerified}
                            >
                                {isFormSubmitted ? t('VERIFIED_BUTTON') : isVeifying ? <><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Verifying... </> : t('VERIFY_BUTTON')}
                            </Button>
                        </Col>
                    </Row>
                </React.Fragment>
            )}
        </CommonFormikComponent>
    );
};

export default IdVerificationTab;