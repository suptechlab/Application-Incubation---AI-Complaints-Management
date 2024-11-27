import React, { useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormCheckbox from '../../../../components/formCheckbox';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import SvgIcons from '../../../../components/SVGIcons';

const RaisedComplaintModal = ({ handleShow, handleClose }) => {
    const [fileName, setFileName] = useState("Fi_Users_data.xlsx");
    const { t } = useTranslation()

    // Initial Values
    const initialValues = {
        instanceTicket: '',
        comments: '',
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
                Raise a Complaint
                </Modal.Title>
            </Modal.Header>
            <CommonFormikComponent
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <React.Fragment>
                        <Modal.Body className="text-break small pt-3">
                            <Row className="gx-4">
                                <Col lg={6}>
                                    <ReactSelect
                                        label={t("2nd Instance Claim Ticket")}
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
                                        label={t("Precedents*")}
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
                                        label={t("Specific Petition*")}
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
                                                <span className='align-middle'>{t("Upload Optional Attachments")}</span>
                                            </label>
                                            <input
                                                id="files"
                                                accept="image/png, image/jpeg, image/jpg"
                                                className="h-100 hiddenText opacity-0 position-absolute start-0 top-0 w-100 z-n1"
                                                type="file"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <span className='custom-font-size-12 fw-medium'>Multiple attachment can be uploaded.</span>
                                    </div>
                                    {fileName && (
                                        <div className='pt-1'>
                                            <Link
                                                target="_blank"
                                                to="/"
                                                className="text-decoration-none small mw-100 text-break"
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