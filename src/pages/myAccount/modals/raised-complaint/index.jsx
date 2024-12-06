import React, { useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormCheckbox from '../../../../components/formCheckbox';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import SvgIcons from '../../../../components/SVGIcons';
import { RaiseComplaintSchema } from '../../validations';
import toast from 'react-hot-toast';

const RaisedComplaintModal = ({ handleShow, handleClose }) => {

    const { t } = useTranslation();
    const [files, setFiles] = useState([]);

    // Initial Values
    const initialValues = {
        instanceTicket: '',
        comments: '',
        agreeDeclarations: false,
        precedents: '',
        specificPetition: ''
    };

    //Handle File Change
    const handleFileChange = (event) => {
        const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB in bytes
        const MAX_FILE_COUNT = 3; // Maximum number of files allowed

        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files);

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

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        actions.setSubmitting(false);
        actions.resetForm();
    };

    return (
        <Modal
            show={handleShow}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered={true}
            scrollable={true}
            size="lg"
            className="theme-modal"
            enforceFocus={false}
        >
            <Modal.Header closeButton className="pb-2">
                <Modal.Title as="h4" className="fw-bold">
                    {t('RAISE_A_COMPLAINT')}
                </Modal.Title>
            </Modal.Header>
            <CommonFormikComponent
                initialValues={initialValues}
                validationSchema={RaiseComplaintSchema}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <React.Fragment>
                        <Modal.Body className="text-break small pt-3">
                            <Row className="gx-4">
                                <Col lg={6}>
                                    <ReactSelect
                                        label={t("SECOND_INSTANCE_CLAIM_TICKET") + '*'}
                                        error={formikProps.errors.instanceTicket}
                                        options={[
                                            { label: t("SELECT"), value: "" }
                                        ]}
                                        value={formikProps.values.instanceTicket}
                                        onChange={(option) => {
                                            formikProps.setFieldValue("instanceTicket", option?.target?.value ?? "");
                                        }}
                                        name="instanceTicket"
                                        className={formikProps.touched.instanceTicket && formikProps.errors.instanceTicket ? "is-invalid" : ""}
                                        onBlur={formikProps.handleBlur}
                                        touched={formikProps.touched.instanceTicket}
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
                                                <span className='me-2'>{SvgIcons.uploadIcon}</span>
                                                <span className='align-middle'>{t("UPLOAD_OPTIONAL_ATTACHMENTS")}</span>
                                            </label>
                                            <input
                                                id="files"
                                                accept=".pdf, .docx, .doc, .txt, .rtf"
                                                multiple
                                                className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                                type="file"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <span className='custom-font-size-12 fw-medium'>{t("MULTIPLE_ATTACHMENTS_UPLOADED_MSG")}</span>
                                    </div>
                                    {files.length > 0 && (
                                        <div>
                                            <ul>
                                                {files.map((file, index) => (
                                                    <li key={index} className="d-flex align-items-center">
                                                        <span className="me-2">{file.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
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
                        </Modal.Body>
                        <Modal.Footer className="border-top">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                className="custom-min-width-100"
                            >
                                {t("Cancel")}
                            </Button>
                            <Button
                                type="submit"
                                variant="warning"
                                className="custom-min-width-100"
                            >
                                {t("Submit")}
                            </Button>
                        </Modal.Footer>
                    </React.Fragment>
                )}
            </CommonFormikComponent>
        </Modal>
    )
}

export default RaisedComplaintModal