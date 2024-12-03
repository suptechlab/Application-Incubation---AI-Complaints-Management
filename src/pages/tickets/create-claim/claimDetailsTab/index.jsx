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

const ClaimDetailsTab = ({ backButtonClickHandler, handleFormSubmit, setIsLoading }) => {

    const [fileName, setFileName] = useState("Fi_Users_data.xlsx");
    const { t } = useTranslation();
    const [claimTypes, setClaimTypes] = useState([]);
    const [claimSubTypes, setClaimSubTypes] = useState([]);



    // Initial Values
    const initialValues = {
        claimTypeId: '',
        claimSubTypeId: '',
        precedents: '',
        specificPetition: '',
        attachments: '',
        agreeDeclarations: false,
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
                    validationSchema={ClaimDetailsFormSchema}
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
                                                formikProps.setFieldValue("claimSubtype", "");
                                                getClaimSubTypes(option?.target?.value);
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