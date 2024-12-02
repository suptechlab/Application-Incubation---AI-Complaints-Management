import React, { useState } from 'react';
import { Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormCheckbox from '../../../../components/formCheckbox';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { fetchClaimSubTypes } from '../../../../redux/slice/masterSlice';
import { ClaimDetailsFormSchema } from '../../validations';

const ClaimDetailsTab = ({ backButtonClickHandler, handleFormSubmit,setIsLoading }) => {
    const [fileName, setFileName] = useState("Fi_Users_data.xlsx");

    const { t } = useTranslation()

    const { claim_types } = useSelector((state) => state?.masterSlice)

    const dispatch = useDispatch()

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
        const response = await dispatch(fetchClaimSubTypes(claimTypeId))
        if (fetchClaimSubTypes.fulfilled.match(response)) {
            setClaimSubTypes(response?.payload)
            setIsLoading(false)
        } else {
            setIsLoading(false)
            console.error('Sub types error:', response.error.message);
        }
    }

    return (
        <CommonFormikComponent
            validationSchema={ClaimDetailsFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <Modal.Body className="text-break d-flex flex-column small pt-0">
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
                                        { label: t("SELECT"), value: "" },
                                        ...claim_types.map((group) => ({
                                            label: group.label,
                                            value: group.value,
                                        })),
                                    ]}
                                    value={formikProps.values.claimTypeId}
                                    onChange={(option) => {

                                        formikProps.setFieldValue("claimTypeId", option?.target?.value ?? "");
                                        if (option?.target?.value && option?.target?.value !== "") {
                                            // formikProps.setFieldTouched("cityId", false);
                                            if(option?.target?.value !== formikProps?.values?.claimTypeId){
                                                formikProps.setFieldValue("claimSubtype", ""); // Reset cityId
                                                getClaimSubTypes(option?.target?.value);
                                            }
                                        }
                                    
                                        // formikProps.setFieldValue("claimSubtype", "");
                                       
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
                            {/* <Col xs={12} className="mb-3">
                                <div className="theme-upload-cover d-inline-flex align-items-center gap-3">
                                    <div className="overflow-hidden position-relative z-1 flex-shrink-0">
                                        <label
                                            htmlFor="files"
                                            className="btn btn-secondary"
                                        >
                                            <span className='me-2'>{SvgIcons.uploadIcon}</span>{t("UPLOAD_OPTIONAL_ATTACHMENTS")}
                                        </label>
                                        <input
                                            id="files"
                                            accept="image/png, image/jpeg, image/jpg"
                                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {fileName && (
                                        <Link
                                            target="_blank"
                                            to="/fi-users/import"
                                            className="text-decoration-none small mw-100 text-break"
                                        >
                                            {fileName}
                                        </Link>
                                    )}
                                </div>
                            </Col> */}
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
                    </Modal.Body>
                    <Modal.Footer className="border-top">
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
                    </Modal.Footer>
                </React.Fragment>

            )}
        </CommonFormikComponent>
    )
}

export default ClaimDetailsTab