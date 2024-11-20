import React from 'react';
import { Button, Col, Modal, Row, Stack } from 'react-bootstrap';
import CommonFormikComponent from '../../../../components/CommonFormikComponent';
import FormInputBox from '../../../../components/FormInput';
import ReactSelect from '../../../../components/ReactSelect';
import { OtherInfoFormSchema } from '../../validations';
import { useSelector } from 'react-redux';

const OtherInfoTab = ({ backButtonClickHandler, handleFormSubmit }) => {

    const { customer_types, priority_care_group } = useSelector((state) => state?.masterSlice)

    // Initial Values
    const initialValues = {
        priorityCareGroup: '',
        customerType: '',
        entityName: '',
        entitysTaxID: '',
    };

    // Handle Submit Handler
    const handleSubmit = (values, actions) => {
        handleFormSubmit(values, actions);
    };
    return (
        <CommonFormikComponent
            // validationSchema={OtherInfoFormSchema}
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
                            <h5 className="custom-font-size-18 mb-0 fw-bold">Other Information</h5>
                        </Stack>
                        <Row className="gx-4">
                            <Col lg={6}>
                                <ReactSelect
                                    label="Priority care group*"
                                    error={formikProps.errors.priorityCareGroup}
                                    options={[
                                        { label: "Select", value: "" },
                                        ...priority_care_group.map((group) => ({
                                            label: group.label, // Ensure group has a `label` property
                                            value: group.value, // Ensure group has a `value` property
                                        }))
                                    ]}
                                    value={formikProps.values.priorityCareGroup}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "priorityCareGroup",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="priorityCareGroup"
                                    className={formikProps.touched.priorityCareGroup && formikProps.errors.priorityCareGroup ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.priorityCareGroup}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label="Customer Type*"
                                    error={formikProps.errors.customerType}
                                    options={[
                                        { label: "Select", value: "" },
                                        ...customer_types.map((group) => ({
                                            label: group.label, // Ensure group has a `label` property
                                            value: group.value, // Ensure group has a `value` property
                                        }))
                                    ]}
                                    value={formikProps.values.customerType}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "customerType",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="customerType"
                                    className={formikProps.touched.customerType && formikProps.errors.customerType ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.customerType}
                                />
                            </Col>
                            <Col lg={6}>
                                <ReactSelect
                                    label="Entity Name*"
                                    error={formikProps.errors.entityName}
                                    options={[{ label: "Select", value: "" }, { label: "Option 1", value: "option-1" }]}
                                    value={formikProps.values.entityName}
                                    onChange={(option) => {
                                        formikProps.setFieldValue(
                                            "entityName",
                                            option?.target?.value ?? ""
                                        );
                                    }}
                                    name="entityName"
                                    className={formikProps.touched.entityName && formikProps.errors.entityName ? "is-invalid" : ""}
                                    onBlur={formikProps.handleBlur}
                                    touched={formikProps.touched.entityName}
                                />
                            </Col>
                            <Col lg={6}>
                                <FormInputBox
                                    id="entitysTaxID"
                                    label="Entity's Tax ID (RUC)"
                                    name="entitysTaxID"
                                    type="text"
                                    error={formikProps.errors.entitysTaxID}
                                    onBlur={formikProps.handleBlur}
                                    onChange={formikProps.handleChange}
                                    touched={formikProps.touched.entitysTaxID}
                                    value={formikProps.values.entitysTaxID || ""}
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

export default OtherInfoTab