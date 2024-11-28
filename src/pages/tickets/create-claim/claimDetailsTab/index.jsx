import { Formik } from "formik";
import React, { useState } from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { ClaimDetailsFormSchema } from '../../../../validations/createClaim.validation';
import CommonFormikComponent from "../../../../components/CommonFormikComponent";

const ClaimDetailsTab = ({ backButtonClickHandler, handleFormSubmit, setIsLoading }) => {
    const [fileName, setFileName] = useState("Fi_Users_data.xlsx");

    const { t } = useTranslation()



    // Initial Values
    const initialValues = {
        claimTypeId: '',
        claimSubTypeId: '',
        precedents: '',
        specificPetition: '',
        attachments: '',
        agreeDeclarations: false,
    };

    const [claimSubTypes, setClaimSubTypes] = useState([])
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

    const getClaimSubTypes = async (claimTypeId) => {
        setIsLoading(true)
        // const response = await dispatch(fetchClaimSubTypes(claimTypeId))
        // if (fetchClaimSubTypes.fulfilled.match(response)) {
        //     setClaimSubTypes(response?.payload)
        //     setIsLoading(false)
        // } else {
        //     setIsLoading(false)
        //     console.error('Sub types error:', response.error.message);
        // }
    }

    return (
        <Card className="border-0 flex-grow-1 d-flex flex-column shadow">
            <Card.Body className="d-flex flex-column">
                <CommonFormikComponent
                    validationSchema={ClaimDetailsFormSchema}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    {(formikProps) => (
                        <React.Fragment>
                            <div className="text-break d-flex flex-column small pt-0">
                                <Stack
                                    direction="horizontal"
                                    gap={2}
                                    className="mb-2 pb-1 flex-wrap"
                                >
                                    <h5 className="custom-font-size-18 mb-0 fw-bold">{t("CLAIM_DETAILS")}</h5>
                                </Stack>
                                <Row className="gx-4">
                                    <Col lg={6}>
                                        <ReactSelect
                                            label={t("CLAIM_TYPE")}
                                            error={formikProps.errors.claimTypeId}
                                            options={[
                                                // { label: t("SELECT"), value: "" },
                                                // ...claim_types.map((group) => ({
                                                //     label: group.label,
                                                //     value: group.value,
                                                // })),
                                            ]}
                                            value={formikProps.values.claimTypeId}
                                            onChange={(option) => {
                                                formikProps.setFieldValue("claimTypeId", option?.target?.value ?? "");
                                                formikProps.setFieldValue("claimSubtype", "");
                                                getClaimSubTypes(option?.target?.value);
                                            }}
                                            name="claimTypeId"
                                            className={formikProps.touched.claimTypeId && formikProps.errors.claimTypeId ? "is-invalid" : ""}
                                            onBlur={formikProps.handleBlur}
                                            touched={formikProps.touched.claimTypeId}
                                        />
                                    </Col>
                                    <Col lg={6}>
                                        <ReactSelect
                                            label={t("CLAIM_SUBTYPE")}
                                            error={formikProps.errors.claimSubTypeId}
                                            options={[
                                                { label: t("SELECT"), value: "" },
                                                ...claimSubTypes.map((group) => ({
                                                    label: group.label,
                                                    value: group.value,
                                                })),
                                            ]}
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

                                </Row>
                            </div>
                            <div className="border-top">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={backButtonClickHandler}
                                    className="custom-min-width-100 me-auto"
                                >
                                    <span className="me-1">&lt;</span>{t("BACK")}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="warning"
                                    className="custom-min-width-100"
                                    disabled={formikProps?.isSubmitting ?? false}
                                >
                                    {t("FINISH")}<span className="ms-1">&gt;</span>
                                </Button>
                            </div>
                        </React.Fragment>

                    )}
                </CommonFormikComponent>
            </Card.Body>
        </Card>
    )
}

export default ClaimDetailsTab