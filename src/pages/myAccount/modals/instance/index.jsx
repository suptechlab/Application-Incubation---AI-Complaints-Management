import React, { useState } from 'react';
import { Badge, Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormCheckbox from '../../../../components/formCheckbox';
import FormInputBox from '../../../../components/FormInput';
import SvgIcons from '../../../../components/SVGIcons';
import { SecondInstanceFormSchema } from '../../validations';
import toast from 'react-hot-toast';
import { fileClaimSecondInstanceForm } from '../../../../redux/slice/fileClaimSlice';
import { useDispatch } from 'react-redux';
import Loader from '../../../../components/Loader';
import { MdClose } from 'react-icons/md';
import AppTooltip from '../../../../components/tooltip';

const InstanceModal = ({ handleShow, selectedRow, handleClose }) => {

    const [loading, setLoading] = useState(false)
    const [files, setFiles] = useState([]);
    const { t } = useTranslation();
    const dispatch = useDispatch();


    // Initial Values
    const initialValues = {
        instanceTicket: selectedRow ? selectedRow?.ticketId : '',
        comments: '',
        agreeDeclarations: false,
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

    const removeFile = (indexToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    // Handle Submit Handler
    const handleSubmit = async (values, actions) => {
        const appendFilesToFormData = (formData, files) => {
            files.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });
        };
        const formData = new FormData();
        formData.append('id', selectedRow?.id);
        formData.append('comment', values.comments);
        appendFilesToFormData(formData, files);
        setLoading(true);
        const result = await dispatch(fileClaimSecondInstanceForm(formData));
        if (fileClaimSecondInstanceForm.fulfilled.match(result)) {
            toast.success(t('SECOND_CLAIM_SUCCESS'));
            setLoading(false);
            handleCloseModal();
            actions.setSubmitting(false);
        } else {
            console.error("Verification error:", result.error?.message);
            toast.error(result.error?.message);
            actions.setSubmitting(false);
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        handleClose();
        setFiles([]);
    }

    return (
        <React.Fragment>
            <Loader isLoading={loading} />
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
                        {t('RAISE_A_SECOND_INSTANCE_CLAIM')}
                    </Modal.Title>
                </Modal.Header>
                <CommonFormikComponent
                    initialValues={initialValues}
                    validationSchema={SecondInstanceFormSchema}
                    onSubmit={handleSubmit}
                >
                    {(formikProps) => (
                        <React.Fragment>
                            <Modal.Body className="text-break small pt-3">
                                <Row className="gx-4">
                                    <Col lg={6}>
                                        <FormInputBox
                                            id="instanceTicket"
                                            label={t("FIRST_INSTANCE_COMPLAINT_TICKET")}
                                            name="instanceTicket"
                                            type="text"
                                            rows="3"
                                            error={formikProps.errors.instanceTicket}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            touched={formikProps.touched.instanceTicket}
                                            value={formikProps.values.instanceTicket || ""}
                                            readOnly={true}
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <FormInputBox
                                            id="comments"
                                            label={t("COMMENTS")}
                                            name="comments"
                                            type="text"
                                            as="textarea"
                                            rows="3"
                                            error={formikProps.errors.comments}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            touched={formikProps.touched.comments}
                                            value={formikProps.values.comments || ""}
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
                                                    <span className='align-middle'>{t("ATTACH_NEW_EVIDENCE")}</span>
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
                                    onClick={handleClose}
                                    className="custom-min-width-100"
                                >
                                    {t("CANCEL")}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="warning"
                                    className="custom-min-width-100"
                                >
                                    {t("SUBMIT")}
                                </Button>
                            </Modal.Footer>
                        </React.Fragment>
                    )}
                </CommonFormikComponent>
            </Modal>
        </React.Fragment>

    )
}

export default InstanceModal