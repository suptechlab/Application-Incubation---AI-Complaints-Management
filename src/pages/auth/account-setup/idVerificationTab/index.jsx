import React, { useState } from "react";
import { Button, Col, Row, Stack } from "react-bootstrap";
import { FiInfo } from "react-icons/fi";
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormInputBox from "../../../../components/FormInput";
import SvgIcons from "../../../../components/SVGIcons";
import AppTooltip from "../../../../components/tooltip";
import { IdVerificationFormSchema } from "../../validations";
import { useDispatch } from "react-redux";
import { fingerPrintValidate, nationalIdVerify } from "../../../../redux/slice/authSlice";
import toast from "react-hot-toast";

const IdVerificationTab = ({ isSubmitted,setNewAccountData }) => {
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const dispatch = useDispatch()
    // Initial Values
    const [initialValues] = useState({
        nationalID: '1716194319', // REMOVE THIS VALUE AFTER DEVELOPMENT
        fingerprintCode: '',
    });

    const [isIdVerified, setIsVerified] = useState(false)
    // Handle Submit Handler
    const handleSubmit = async (values, actions) => {

        isSubmitted(true);
        setIsFormSubmitted(true)

        setNewAccountData((prev)=> ({...prev , identificacion: values?.nationalID, individualDactilar: values?.fingerprintCode }))

        // handleFormSubmit(values, actions);

        // UNCOMMENT THIS CODE ONCE FINGERPRINT API STARTS

        // const result = await dispatch(fingerPrintValidate({ identificacion: values?.nationalID, individualDactilar: values?.fingerprintCode }));
        // if (fingerPrintValidate.fulfilled.match(result)) {
        //     isSubmitted(true);
        //     setIsFormSubmitted(true)
        // } else {
        //     console.log("ARE YOU IN ELSE PART NA")
        //     setIsFormSubmitted(false)
        // }
        actions.setSubmitting(false);
    };

    // Handle National ID Verification
    const handleNationalIdVerify = async (value) => {
        if (value && value !== '') {

            setIsVerified(true)
            setNewAccountData((prev)=> ({...prev , identificacion: value}))

            //  COMMENTED THIS BECAUSE AS OF NOW I DON'T HAVE BHUT SARI NATIONAL ID'S FOR VERIFY
            

            // const result = await dispatch(nationalIdVerify(value));
            // if (nationalIdVerify.fulfilled.match(result)) {
            //     setIsVerified(true)
            //     setNewAccountData((prev)=> ({...prev , identificacion: value}))
            // } else {
            //     console.error('Verification error:', result.error.message);
            // }
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
                        <h5 className="custom-font-size-18 mb-0 fw-bold">National ID Verification</h5>
                        <AppTooltip
                            title="National ID Verification Tooltip Data"
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
                                label="National ID Number"
                                name="nationalID"
                                type="text"
                                error={formikProps.errors.nationalID}
                                onBlur={(event) => handleNationalIdVerify(event?.target?.value)}
                                onChange={formikProps.handleChange}
                                touched={formikProps.touched.nationalID}
                                value={formikProps.values.nationalID || ""}
                                inputIcon={isFormSubmitted && <span className="text-success position-absolute top-0 end-0 p-1 custom-width-42 h-100 d-inline-flex align-items-center justify-content-center pe-none user-select-none">{SvgIcons.checkBadgeIcon}</span>}
                                inputClassName={isFormSubmitted && "custom-padding-right-42"}
                            />
                        </Col>
                        <Col lg>
                            <FormInputBox
                                autoComplete="off"
                                id="fingerprintCode"
                                label="Fingerprint code"
                                name="fingerprintCode"
                                type="text"
                                error={formikProps.errors.fingerprintCode}
                                onBlur={formikProps?.handleBlur}
                                onChange={formikProps.handleChange}
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
                                disabled={isFormSubmitted || !isIdVerified}
                            >
                                {isFormSubmitted ? 'Verified' : 'Verify'}
                            </Button>
                        </Col>
                    </Row>
                </React.Fragment>
            )}
        </CommonFormikComponent>
    );
};

export default IdVerificationTab;