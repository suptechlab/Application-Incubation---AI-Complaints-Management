import React, { useState } from 'react';
import { Badge, Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormCheckbox from '../../../../components/formCheckbox';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { fetchClaimSubTypes } from '../../../../redux/slice/masterSlice';
import { ClaimDetailsFormSchema } from '../../validations';
import SvgIcons from '../../../../components/SVGIcons';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdClose } from 'react-icons/md';
import AppTooltip from '../../../../components/tooltip';

const ClaimDetailsTab = ({ backButtonClickHandler, handleFormSubmit, setIsLoading }) => {
    const { t } = useTranslation()
    const { claim_types } = useSelector((state) => state?.masterSlice);
    const [files, setFiles] = useState([]);
    const dispatch = useDispatch()

    // Initial Values
    const initialValues = {
        claimTypeId: '',
        claimSubTypeId: '',
        precedents: '',
        specificPetition: '',
        agreeDeclarations: false,
    };

    const [claimSubTypes, setClaimSubTypes] = useState([])
    //Handle File Change
    const handleFileChange = (event) => {
        const MAX_FILE_SIZE = 1 * 1024 * 1024; // 5 MB in bytes
        const MAX_FILE_COUNT = 3; // Maximum number of files allowed

        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files);

            // Filter files based on size
            const validFiles = selectedFiles.filter((file) => {
                if (file.size > MAX_FILE_SIZE) {
                    toast.error(`${file.name}` + ' ' + t('TOO_LARGE_FILE'));
                    return false;
                }
                return true;
            });

            if (validFiles.length > 0) {
                setFiles((prevFiles) => {
                    const totalFiles = prevFiles.length + validFiles.length;

                    if (totalFiles > MAX_FILE_COUNT) {
                        toast.error(t('TOO_MANY_FILES'));
                        return prevFiles;
                    }

                    return [...prevFiles, ...validFiles];
                });
            }
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit({ ...values, files }, actions);
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
                                    label={t("CLAIM_TYPE") + '*'}
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
                                            if (option?.target?.value !== formikProps?.values?.claimTypeId) {
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
                                    label={t("CLAIM_SUBTYPE") + '*'}
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
                                    label={t("PRECEDENTS") + '*'}
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
                                    label={t("SPECIFIC_PETITION") + '*'}
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
                            <Col xs={12} className="mb-3">
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
                                            accept=".pdf, .docx, .doc, .txt, .rtf, image/jpeg, image/jpg"
                                            multiple
                                            className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <span className='custom-font-size-12 fw-medium'>{t("MULTIPLE_ATTACHMENTS_UPLOADED_MSG")}</span>
                                </div>

                                {files.length > 0 && (
                                    <Stack direction='horizontal' gap={2} className="mt-2">
                                        {files.map((file, index) => (
                                            <Badge key={index} className="d-inline-flex align-items-center gap-2 text-info px-3" pill bg='secondary-subtle'>
                                                <span>{file.name}</span>
                                                <AppTooltip title={t('REMOVE')}>
                                                    <Button
                                                        variant="link"
                                                        className='p-0 border-0 lh-sm'
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <MdClose size={16} />
                                                    </Button>
                                                </AppTooltip>
                                            </Badge>
                                        ))}
                                    </Stack>
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

            )
            }
        </CommonFormikComponent >
    )
}

export default ClaimDetailsTab