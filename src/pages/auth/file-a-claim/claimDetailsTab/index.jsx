import React, { useState } from 'react';
import { Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { ClaimDetailsFormSchema } from '../../validations';
import FormCheckbox from '../../../../components/formCheckbox';
import { MdBackup } from 'react-icons/md';
import { Link } from 'react-router-dom';

const ClaimDetailsTab = ({ backButtonClickHandler, handleFormSubmit }) => {
    const [fileName, setFileName] = useState("Fi_Users_data.xlsx");

    // Initial Values
    const initialValues = {
        claimType: '',
        claimSubtype: '',
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
                            <h5 className="custom-font-size-18 mb-0 fw-bold">Claim Details</h5>
                        </Stack>
                        <Row className="gx-4">
                            <Col lg={6}>
                                <ReactSelect
                                    label="Claim Type*"
                                    error={formikProps.errors.claimType}
                                    options={[{ label: "Select", value: "" }, { label: "Option 1", value: "option-1" }]}
                                    value={formikProps.values.claimType}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "claimType",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="claimType"
                                    className={formikProps.touched.claimType && formikProps.errors.claimType ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.claimType}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label="Claim Subtype"
                                    error={formikProps.errors.claimSubtype}
                                    options={[{ label: "Select", value: "" }, { label: "Option 1", value: "option-1" }]}
                                    value={formikProps.values.claimSubtype}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "claimSubtype",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="claimSubtype"
                                    className={formikProps.touched.claimSubtype && formikProps.errors.claimSubtype ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.claimSubtype}
                                />
                            </Col>
                            <Col xs={12}>
                                <FormInputBox
                                    id="precedents"
                                    label="Precedents*"
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
                                    label="Specific Petition*"
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
                                            <span className='me-2'><MdBackup size={20}/></span>Upload Optional Attachments
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
                                    label="I agreed on all the Declarations, and conditions"
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
                            <span className="me-1">&lt;</span>Back
                        </Button>
                        <Button
                            type="submit"
                            variant="warning"
                            className="custom-min-width-100"
                        >
                            Next<span className="ms-1">&gt;</span>
                        </Button>
                    </Modal.Footer>
                </React.Fragment>
            )}
        </CommonFormikComponent>
    )
}

export default ClaimDetailsTab