import React, { useState } from "react";
import { Button, Col, Row, Stack } from "react-bootstrap";
import { FiInfo } from "react-icons/fi";
import CommonFormikComponent from "../../../../components/CommonFormikComponent";
import FormInputBox from "../../../../components/FormInput";
import SvgIcons from "../../../../components/SVGIcons";
import AppTooltip from "../../../../components/tooltip";
import { IdVerificationFormSchema } from "../../validations";

const IdVerificationTab = ({ handleFormSubmit }) => {
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    // Initial Values
    const initialValues = {
        nationalID: '',
        fingerprintCode: '',
        otpCode: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        setIsFormSubmitted(true)
        handleFormSubmit(values, actions);
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
                                onBlur={formikProps.handleBlur}
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
                                onBlur={formikProps.handleBlur}
                                onChange={formikProps.handleChange}
                                touched={formikProps.touched.fingerprintCode}
                                value={formikProps.values.fingerprintCode || ""}
                                inputIcon={isFormSubmitted && <span className="text-success position-absolute top-0 end-0 p-1 custom-width-42 h-100 d-inline-flex align-items-center justify-content-center pe-none user-select-none">{SvgIcons.checkBadgeIcon}</span>}
                                inputClassName={isFormSubmitted && "custom-padding-right-42"}
                            />
                        </Col>
                        <Col xs="auto" className="pt-lg-4">
                            <Button
                                type="submit"
                                variant="warning"
                                className="custom-min-width-90 custom-margin-top-1"
                                disabled={isFormSubmitted}
                            >
                                Verify
                            </Button>
                        </Col>
                    </Row>
                </React.Fragment>
            )}
        </CommonFormikComponent>
    );
};

export default IdVerificationTab;