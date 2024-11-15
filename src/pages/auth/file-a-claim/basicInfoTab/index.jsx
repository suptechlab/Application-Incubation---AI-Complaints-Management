import React from 'react';
import { Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import { FiInfo } from 'react-icons/fi';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormInputBox from '../../../../components/FormInput';
import AppTooltip from '../../../../components/tooltip';
import { BasicInfoFormSchema } from '../../validations';
import ReactSelect from '../../../../components/ReactSelect';


const BasicInfoTab = ({ handleFormSubmit }) => {
    // Initial Values
    const initialValues = {
        nationalID: '',
        email: '',
        name: '',
        gender: '',
        cellphone: '',
        provinceOfResidence: '',
        cantonOfResidence: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };
    return (
        <CommonFormikComponent
            validationSchema={BasicInfoFormSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            {(formikProps) => (
                <React.Fragment>
                    <Modal.Body className="text-break d-flex flex-column small pt-0">
                        <Stack
                            direction="horizontal"
                            gap={2}
                            className="mb-3 flex-wrap"
                        >
                            <h5 className="custom-font-size-18 mb-0 fw-bold">Basic Information</h5>
                            <AppTooltip
                                title="Basic Information Tooltip Data"
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
                            <Col lg={6}>
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
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    autoComplete="off"
                                    id="email"
                                    label="Email"
                                    name="email"
                                    type="email"
                                    error={formikProps.errors.email}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.email}
                                    value={formikProps.values.email || ""}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    id="name"
                                    label="Name"
                                    name="name"
                                    type="text"
                                    error={formikProps.errors.name}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.name}
                                    value={formikProps.values.name || ""}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label="Gender"
                                    error={formikProps.errors.gender}
                                    options={[{ label: "Select", value: "" }, { label: "Male", value: "male" }]}
                                    value={formikProps.values.gender}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "gender",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="gender"
                                    className={formikProps.touched.gender && formikProps.errors.gender ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.gender}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    id="cellphone"
                                    label="Cellphone"
                                    name="cellphone"
                                    type="text"
                                    error={formikProps.errors.cellphone}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.cellphone}
                                    value={formikProps.values.cellphone || ""}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label="Province of Residence*"
                                    error={formikProps.errors.provinceOfResidence}
                                    options={[{ label: "Select", value: "" }, { label: "Residence 1", value: "residence1" }]}
                                    value={formikProps.values.provinceOfResidence}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "provinceOfResidence",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="provinceOfResidence"
                                    className={formikProps.touched.provinceOfResidence && formikProps.errors.provinceOfResidence ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.provinceOfResidence}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label="Canton of Residence*"
                                    error={formikProps.errors.cantonOfResidence}
                                    options={[{ label: "Select", value: "" }, { label: "Residence 2", value: "residence2" }]}
                                    value={formikProps.values.cantonOfResidence}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "cantonOfResidence",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="cantonOfResidence"
                                    className={formikProps.touched.cantonOfResidence && formikProps.errors.cantonOfResidence ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.cantonOfResidence}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top">
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

export default BasicInfoTab